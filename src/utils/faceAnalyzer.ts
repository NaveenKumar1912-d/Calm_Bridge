/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ModalitySignal,
  QualityMetrics,
  FacialAffectAnalysis,
  ExpressionProbabilities,
  ActionUnitCues,
  PersonalBaseline,
} from '../types';
import { interpretFacialAffect } from '../services/safetyEngine';

export interface FaceAnalysisSnapshot {
  analysis: FacialAffectAnalysis;
  quality: QualityMetrics;
  signal: ModalitySignal;
}

export class LiveFaceAnalyzer {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private stream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private isRunning = false;

  private prevFrameData: Uint8ClampedArray | null = null;
  private onSnapshotUpdate?: (snapshot: FaceAnalysisSnapshot) => void;

  // Temporal rolling window (last 15 snapshots ~ 3-5 seconds at 3-5 fps)
  private expressionHistory: ExpressionProbabilities[] = [];
  private smileHistory: number[] = [];
  private blinkTimestamps: number[] = [];

  // Personal Baseline Reference
  private personalBaseline: PersonalBaseline | null = null;

  public setBaseline(baseline: PersonalBaseline | null) {
    this.personalBaseline = baseline;
  }

  public async start(
    videoEl: HTMLVideoElement,
    onSnapshot?: (snapshot: FaceAnalysisSnapshot) => void
  ): Promise<boolean> {
    try {
      this.videoElement = videoEl;
      this.onSnapshotUpdate = onSnapshot;

      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 160;
      this.canvasElement.height = 120;

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user',
        },
      });

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      this.isRunning = true;
      this.expressionHistory = [];
      this.smileHistory = [];
      this.blinkTimestamps = [];
      this.prevFrameData = null;

      this.startLoop();
      return true;
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      return false;
    }
  }

  private startLoop() {
    if (!this.canvasElement || !this.videoElement || !this.isRunning) return;
    const ctx = this.canvasElement.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let frameCount = 0;

    const step = () => {
      if (!this.isRunning || !this.videoElement || !this.canvasElement || !ctx) return;

      frameCount++;
      // Sample ~3 to 5 FPS (every 6th requestAnimationFrame at 60Hz)
      if (frameCount % 6 === 0 && this.videoElement.readyState >= 2) {
        ctx.drawImage(this.videoElement, 0, 0, 160, 120);
        const imgData = ctx.getImageData(0, 0, 160, 120);
        const pixels = imgData.data;

        const timestamp = Date.now();
        const totalPixels = 160 * 120;

        // 1. Illumination & Quality Gate
        let totalBrightness = 0;
        let edgeEnergy = 0;
        let centerEdgeEnergy = 0;

        for (let y = 0; y < 120; y++) {
          for (let x = 0; x < 160; x++) {
            const i = (y * 160 + x) * 4;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
            totalBrightness += brightness;

            // Horizontal edge check
            if (x > 1) {
              const prevR = pixels[i - 4];
              const edgeDiff = Math.abs(r - prevR);
              edgeEnergy += edgeDiff;
              // Check center face bounding region (30% to 70% width and height)
              if (x > 45 && x < 115 && y > 25 && y < 95) {
                centerEdgeEnergy += edgeDiff;
              }
            }
          }
        }

        const avgBrightness = totalBrightness / totalPixels;
        const normalizedEdge = edgeEnergy / (totalPixels * 255);
        const centerEdgeRatio = centerEdgeEnergy / (edgeEnergy || 1);

        // Motion stability & optical difference
        let frameDiff = 0;
        if (this.prevFrameData) {
          for (let i = 0; i < pixels.length; i += 16) {
            frameDiff += Math.abs(pixels[i] - this.prevFrameData[i]);
          }
        }
        this.prevFrameData = new Uint8ClampedArray(pixels);

        const movementRate = Math.min(1, frameDiff / (totalPixels * 4));
        const faceStability = Math.max(0, 1 - movementRate);

        // Quality Gate Evaluations
        const isTooDark = avgBrightness < 28;
        const isTooBright = avgBrightness > 225;
        const isFaceCentered = centerEdgeRatio > 0.42;
        const isFaceVisible = normalizedEdge > 0.028 && !isTooDark && !isTooBright;
        const blurDetected = normalizedEdge < 0.02 && !isTooDark;

        const quality: QualityMetrics = {
          quality: !isFaceVisible
            ? 'poor'
            : isTooDark || isTooBright || !isFaceCentered
            ? 'moderate'
            : 'optimal',
          confidencePenalty: !isFaceVisible
            ? 0.5
            : isTooDark || isTooBright || !isFaceCentered
            ? 0.25
            : 0,
          details: !isFaceVisible
            ? 'Face visibility low or camera obstructed'
            : isTooDark
            ? 'Lighting is too low for reliable observation'
            : isTooBright
            ? 'Excessive lighting glare'
            : !isFaceCentered
            ? 'Face positioned off-center'
            : 'Clear facial visibility',
          lighting: Math.round((avgBrightness / 255) * 100),
          faceDetected: isFaceVisible,
          faceCentered: isFaceCentered,
          blurDetected,
        };

        // 2. Action Units & Landmark Regions Analysis
        // Upper region: Eyebrows / Forehead (Y: 20-50, X: 45-115)
        // Eye region: (Y: 45-65, X: 45-115)
        // Lower region: Mouth / Lips (Y: 75-105, X: 50-110)
        let browContrast = 0;
        let eyeDarkness = 0;
        let mouthBrightness = 0;
        let lipCornerCurvature = 0;

        // Brow tension estimate (high-frequency vertical variations)
        for (let y = 25; y < 50; y++) {
          for (let x = 50; x < 110; x++) {
            const idx = (y * 160 + x) * 4;
            const topIdx = ((y - 1) * 160 + x) * 4;
            browContrast += Math.abs(pixels[idx] - pixels[topIdx]);
          }
        }
        const browLowering = isFaceVisible
          ? Math.min(0.9, Math.max(0.05, browContrast / 32000))
          : 0.15;
        const browRaising = isFaceVisible && browLowering < 0.25 ? 0.35 : 0.1;

        // Mouth curvature & smile vs downturn
        for (let y = 78; y < 102; y++) {
          for (let x = 55; x < 105; x++) {
            const idx = (y * 160 + x) * 4;
            mouthBrightness += pixels[idx];
            // Compare mouth center vs corners
            if (x < 65 || x > 95) {
              lipCornerCurvature += pixels[idx];
            }
          }
        }
        const mouthAvg = mouthBrightness / (24 * 50);
        const lipCornerAvg = lipCornerCurvature / (24 * 20);

        // Smile: elevated lip corners and higher mouth opening reflectance
        const lipCornerPull = isFaceVisible
          ? Math.min(0.95, Math.max(0.05, (lipCornerAvg / 180) * 0.8))
          : 0.1;
        // Downturn: lip corners lower than mouth center
        const lipCornerDrop = isFaceVisible && lipCornerPull < 0.25
          ? Math.min(0.85, Math.max(0.05, (mouthAvg - lipCornerAvg + 30) / 100))
          : 0.08;

        // Eye openness & Blink detection
        for (let y = 48; y < 62; y++) {
          for (let x = 55; x < 105; x++) {
            const idx = (y * 160 + x) * 4;
            eyeDarkness += pixels[idx];
          }
        }
        const eyeAvg = eyeDarkness / (14 * 50);
        const eyeOpenness = isFaceVisible ? Math.min(0.95, Math.max(0.1, eyeAvg / 140)) : 0.5;

        // Blink detection
        if (eyeOpenness < 0.22 && isFaceVisible) {
          if (this.blinkTimestamps.length === 0 || timestamp - this.blinkTimestamps[this.blinkTimestamps.length - 1] > 600) {
            this.blinkTimestamps.push(timestamp);
            if (this.blinkTimestamps.length > 20) this.blinkTimestamps.shift();
          }
        }
        const recentBlinks = this.blinkTimestamps.filter((t) => timestamp - t < 60000).length;

        const actionUnits: ActionUnitCues = {
          browLowering: parseFloat(browLowering.toFixed(2)),
          browRaising: parseFloat(browRaising.toFixed(2)),
          lipCornerDrop: parseFloat(lipCornerDrop.toFixed(2)),
          lipCornerPull: parseFloat(lipCornerPull.toFixed(2)),
          eyeOpenness: parseFloat(eyeOpenness.toFixed(2)),
          blinkRatePerMin: recentBlinks || 14,
          mouthTension: parseFloat(Math.min(1, browLowering * 0.8 + lipCornerDrop * 0.5).toFixed(2)),
          headPosture: movementRate > 0.6 ? 'tilted' : 'upright',
          gazeAvoidance: !isFaceCentered,
        };

        // 3. Compute 7 Expression Probabilities
        let happyProb = lipCornerPull > 0.45 ? lipCornerPull * 0.9 : lipCornerPull * 0.3;
        let sadProb = lipCornerDrop > 0.4 ? lipCornerDrop * 0.85 : lipCornerDrop * 0.2;
        let angryProb = browLowering > 0.55 && lipCornerPull < 0.3 ? browLowering * 0.8 : 0.05;
        let surpriseProb = browRaising > 0.4 && eyeOpenness > 0.6 ? 0.6 : 0.05;
        let fearProb = browRaising > 0.5 && mouthAvg > 140 ? 0.4 : 0.04;
        let disgustProb = browLowering > 0.45 && mouthAvg < 70 ? 0.35 : 0.03;
        let neutralProb = Math.max(
          0.1,
          1 - (happyProb + sadProb + angryProb + surpriseProb + fearProb + disgustProb)
        );

        // Normalize sum to 1.0
        const totalProb =
          happyProb + sadProb + angryProb + surpriseProb + fearProb + disgustProb + neutralProb;
        const expressions: ExpressionProbabilities = {
          happy: parseFloat((happyProb / totalProb).toFixed(2)),
          sad: parseFloat((sadProb / totalProb).toFixed(2)),
          angry: parseFloat((angryProb / totalProb).toFixed(2)),
          surprise: parseFloat((surpriseProb / totalProb).toFixed(2)),
          fear: parseFloat((fearProb / totalProb).toFixed(2)),
          disgust: parseFloat((disgustProb / totalProb).toFixed(2)),
          neutral: parseFloat((neutralProb / totalProb).toFixed(2)),
        };

        // Find dominant expression
        let dominant: keyof ExpressionProbabilities = 'neutral';
        let maxP = -1;
        (Object.keys(expressions) as (keyof ExpressionProbabilities)[]).forEach((k) => {
          if (expressions[k] > maxP) {
            maxP = expressions[k];
            dominant = k;
          }
        });

        // 4. Temporal Smoothing & Change Capture
        this.expressionHistory.push(expressions);
        if (this.expressionHistory.length > 15) this.expressionHistory.shift();

        this.smileHistory.push(expressions.happy);
        if (this.smileHistory.length > 15) this.smileHistory.shift();

        // Sudden drop in positive affect (e.g. smile dropped by > 0.3 within last 3 seconds)
        const recentSmileAvg =
          this.smileHistory.slice(-4).reduce((a, b) => a + b, 0) /
          Math.max(1, this.smileHistory.slice(-4).length);
        const earlierSmileAvg =
          this.smileHistory.slice(0, 4).reduce((a, b) => a + b, 0) /
          Math.max(1, this.smileHistory.slice(0, 4).length);
        const suddenDrop = earlierSmileAvg - recentSmileAvg > 0.28;

        // Sustained flat affect
        const sustainedFlat =
          this.expressionHistory.length >= 10 &&
          this.expressionHistory.every((e) => e.neutral > 0.65 && e.happy < 0.15);

        const temporalChange = {
          expressionShift: this.expressionHistory.length > 5 && maxP > 0.5,
          suddenDropInPositiveAffect: suddenDrop,
          sustainedFlatAffect: sustainedFlat,
          microChangesDuringSpeech: movementRate > 0.15 && movementRate < 0.45,
        };

        // Confidence calculation
        let confidence = 0.85 - quality.confidencePenalty;
        if (quality.quality === 'poor' || !quality.faceDetected) {
          confidence = 0.35;
        }

        const affectAnalysis: FacialAffectAnalysis = {
          expressions,
          dominantExpression: dominant,
          actionUnits,
          expressiveness: parseFloat(Math.min(1, (1 - expressions.neutral)).toFixed(2)),
          faceStability: parseFloat(faceStability.toFixed(2)),
          temporalChange,
          quality,
          confidence: parseFloat(Math.max(0.2, Math.min(0.95, confidence)).toFixed(2)),
          timestamp,
        };

        const signal = interpretFacialAffect(affectAnalysis, quality, this.personalBaseline);

        this.onSnapshotUpdate?.({
          analysis: affectAnalysis,
          quality,
          signal,
        });
      }

      this.animFrameId = requestAnimationFrame(step);
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }
}
