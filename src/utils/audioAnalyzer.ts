/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ModalitySignal,
  QualityMetrics,
  AcousticFeatures,
  VocalStressAnalysis,
  PersonalBaseline,
} from '../types';
import { interpretVoiceAcoustics } from '../services/safetyEngine';

export type VoiceState = 'idle' | 'requesting_permission' | 'listening' | 'processing' | 'error';

export interface AudioAnalysisSnapshot {
  features: AcousticFeatures;
  quality: QualityMetrics;
  signal: ModalitySignal;
  analysis: VocalStressAnalysis;
  audioLevels: number[];
}

export class LiveAudioAnalyzer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;
  private isRunning = false;

  // MediaRecorder for real audio capture & server-side STT fallback
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordedMimeType = 'audio/webm';
  private recordedBlob: Blob | null = null;

  // Accumulated DSP metrics
  private pitchSamples: number[] = [];
  private energySamples: number[] = [];
  private spectralCentroidSamples: number[] = [];
  private pauseCount = 0;
  private lastSilenceStart: number | null = null;
  private totalPauseTimeMs = 0;
  private speechStartTimestamp = 0;
  private zeroCrossingsTotal = 0;
  private frameCount = 0;
  private clippingDetected = false;

  // Speech Recognition (Web Speech API)
  private recognition: any = null;
  private currentTranscript = '';
  private webSpeechActive = false;
  private onTranscriptUpdate?: (text: string, isFinal: boolean) => void;
  private onSnapshotUpdate?: (snapshot: AudioAnalysisSnapshot) => void;
  private onStateChange?: (state: VoiceState, message?: string) => void;

  // Personal Baseline Reference
  private personalBaseline: PersonalBaseline | null = null;

  public setBaseline(baseline: PersonalBaseline | null) {
    this.personalBaseline = baseline;
  }

  private getSupportedMimeType(): string {
    const candidateTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];

    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
      for (const t of candidateTypes) {
        if (MediaRecorder.isTypeSupported(t)) {
          return t;
        }
      }
    }
    return 'audio/webm';
  }

  public async start(
    onTranscript?: (text: string, isFinal: boolean) => void,
    onSnapshot?: (snapshot: AudioAnalysisSnapshot) => void,
    onStateChange?: (state: VoiceState, message?: string) => void
  ): Promise<boolean> {
    try {
      this.onTranscriptUpdate = onTranscript;
      this.onSnapshotUpdate = onSnapshot;
      this.onStateChange = onStateChange;

      this.onStateChange?.('requesting_permission', 'Requesting microphone permission...');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.onStateChange?.(
          'error',
          'Microphone API is not supported in this browser. Please use text input.'
        );
        return false;
      }

      // Try with optimal acoustic processing; fall back to basic audio constraint if rejected
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (audioConstraintErr) {
        console.warn('Advanced audio constraints not supported, falling back to basic audio:', audioConstraintErr);
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();

      // Ensure AudioContext is active (fix browser autoplay/suspended policy)
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;

      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);

      // Initialize MediaRecorder
      this.audioChunks = [];
      this.recordedMimeType = this.getSupportedMimeType();

      try {
        this.mediaRecorder = new MediaRecorder(this.stream, {
          mimeType: this.recordedMimeType,
        });
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        this.mediaRecorder.start(200);
      } catch (recErr) {
        console.warn('MediaRecorder started with default mimeType:', recErr);
        try {
          this.mediaRecorder = new MediaRecorder(this.stream);
          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              this.audioChunks.push(event.data);
            }
          };
          this.mediaRecorder.start(200);
        } catch (_) {}
      }

      this.isRunning = true;
      this.speechStartTimestamp = Date.now();
      this.pitchSamples = [];
      this.energySamples = [];
      this.spectralCentroidSamples = [];
      this.pauseCount = 0;
      this.lastSilenceStart = null;
      this.totalPauseTimeMs = 0;
      this.zeroCrossingsTotal = 0;
      this.frameCount = 0;
      this.clippingDetected = false;
      this.currentTranscript = '';

      this.onStateChange?.('listening', 'Microphone active — speak naturally...');

      this.startLoop();
      this.initSpeechRecognition();

      return true;
    } catch (err: any) {
      console.warn('Microphone error:', err);
      let errorMsg = 'Microphone access was denied or unavailable.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Microphone permission was denied. Please allow microphone in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No microphone device was detected on your system.';
      }
      this.onStateChange?.('error', errorMsg);
      return false;
    }
  }

  private initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.webSpeechActive = false;
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = navigator.language || 'en-US';

      this.recognition.onstart = () => {
        this.webSpeechActive = true;
      };

      this.recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            this.currentTranscript += ' ' + res[0].transcript;
            this.onTranscriptUpdate?.(this.currentTranscript.trim(), true);
          } else {
            interim += res[0].transcript;
          }
        }
        if (interim) {
          this.onTranscriptUpdate?.((this.currentTranscript + ' ' + interim).trim(), false);
        }
      };

      this.recognition.onerror = (e: any) => {
        // If silence or no speech, do not treat as fatal error
        if (e.error !== 'no-speech') {
          console.warn('SpeechRecognition notice:', e.error);
        }
      };

      this.recognition.onend = () => {
        // Keep listening while isRunning is true (auto-restart)
        if (this.isRunning && this.recognition) {
          try {
            this.recognition.start();
          } catch (_) {}
        }
      };

      this.recognition.start();
    } catch (err) {
      console.warn('Speech recognition initialization note:', err);
    }
  }

  private startLoop() {
    if (!this.analyser || !this.isRunning) return;

    const timeBuffer = new Float32Array(this.analyser.fftSize);
    const freqBuffer = new Uint8Array(this.analyser.frequencyBinCount);

    const step = () => {
      if (!this.isRunning || !this.analyser) return;

      this.frameCount++;
      this.analyser.getFloatTimeDomainData(timeBuffer);
      this.analyser.getByteFrequencyData(freqBuffer);

      // 1. RMS Energy & Clipping
      let sumSquares = 0;
      let zeroCrossings = 0;
      for (let i = 0; i < timeBuffer.length; i++) {
        const val = timeBuffer[i];
        sumSquares += val * val;
        if (Math.abs(val) > 0.98) {
          this.clippingDetected = true;
        }
        if (i > 0 && ((val >= 0 && timeBuffer[i - 1] < 0) || (val < 0 && timeBuffer[i - 1] >= 0))) {
          zeroCrossings++;
        }
      }
      this.zeroCrossingsTotal += zeroCrossings;
      const rms = Math.sqrt(sumSquares / timeBuffer.length);
      this.energySamples.push(rms);
      if (this.energySamples.length > 100) this.energySamples.shift();

      // 2. Fundamental Frequency (F0 Pitch) via Autocorrelation
      const pitch = this.estimatePitch(timeBuffer, this.audioCtx?.sampleRate || 44100);
      if (pitch >= 65 && pitch <= 420) {
        this.pitchSamples.push(pitch);
        if (this.pitchSamples.length > 100) this.pitchSamples.shift();
      }

      // 3. Spectral Centroid (Vocal Brightness & Strain)
      let weightedFreqSum = 0;
      let totalFreqMagnitude = 0;
      const sampleRate = this.audioCtx?.sampleRate || 44100;
      const binFreqStep = sampleRate / (2 * freqBuffer.length);

      for (let i = 0; i < freqBuffer.length; i++) {
        const mag = freqBuffer[i];
        const freq = i * binFreqStep;
        weightedFreqSum += freq * mag;
        totalFreqMagnitude += mag;
      }
      const centroid = totalFreqMagnitude > 0 ? weightedFreqSum / totalFreqMagnitude : 1500;
      this.spectralCentroidSamples.push(centroid);
      if (this.spectralCentroidSamples.length > 60) this.spectralCentroidSamples.shift();

      // 4. Pause & Silence Duration Tracking
      const isSilence = rms < 0.015;
      const now = Date.now();
      if (isSilence) {
        if (!this.lastSilenceStart) {
          this.lastSilenceStart = now;
        } else {
          const pauseDur = now - this.lastSilenceStart;
          if (pauseDur > 350) {
            this.totalPauseTimeMs += 16;
            this.pauseCount++;
          }
        }
      } else {
        this.lastSilenceStart = null;
      }

      // 5. Build Acoustic Features Object
      const durationMs = Math.max(100, now - this.speechStartTimestamp);
      const silenceRatio = Math.min(1, this.totalPauseTimeMs / durationMs);

      const pitchMean =
        this.pitchSamples.length > 0
          ? this.pitchSamples.reduce((a, b) => a + b, 0) / this.pitchSamples.length
          : 165;
      const pitchMin = this.pitchSamples.length > 0 ? Math.min(...this.pitchSamples) : pitchMean;
      const pitchMax = this.pitchSamples.length > 0 ? Math.max(...this.pitchSamples) : pitchMean;
      const pitchRange = pitchMax - pitchMin;

      const pitchVariance =
        this.pitchSamples.length > 1
          ? Math.sqrt(
              this.pitchSamples.reduce((sum, p) => sum + Math.pow(p - pitchMean, 2), 0) /
                this.pitchSamples.length
            )
          : 22;

      let periodDiffSum = 0;
      for (let i = 1; i < this.pitchSamples.length; i++) {
        periodDiffSum += Math.abs(1 / this.pitchSamples[i] - 1 / this.pitchSamples[i - 1]);
      }
      const avgPeriod = 1 / (pitchMean || 165);
      const jitterEstimate =
        this.pitchSamples.length > 2
          ? Math.min(1, (periodDiffSum / (this.pitchSamples.length - 1)) / avgPeriod)
          : 0.02;

      const centroidMean =
        this.spectralCentroidSamples.length > 0
          ? this.spectralCentroidSamples.reduce((a, b) => a + b, 0) /
            this.spectralCentroidSamples.length
          : 1600;

      const speakingRate = Math.min(
        6.5,
        Math.max(1.2, (this.zeroCrossingsTotal / (this.frameCount * timeBuffer.length)) * 14)
      );

      const energyDb = Math.max(-60, Math.round(20 * Math.log10(rms + 1e-5)));

      let strain: 'low' | 'moderate' | 'elevated' = 'low';
      let arousal: 'calm' | 'flat_monotone' | 'animated' | 'agitated' = 'calm';

      if (pitchVariance < 14 && rms < 0.035 && silenceRatio > 0.35) {
        arousal = 'flat_monotone';
        strain = 'moderate';
      } else if (pitchVariance > 48 && speakingRate > 3.8 && rms > 0.09) {
        arousal = 'agitated';
        strain = 'elevated';
      } else if (pitchVariance > 28) {
        arousal = 'animated';
        strain = 'low';
      }

      const features: AcousticFeatures = {
        pitchMeanHz: Math.round(pitchMean),
        pitchMinHz: Math.round(pitchMin),
        pitchMaxHz: Math.round(pitchMax),
        pitchRangeHz: Math.round(pitchRange),
        pitchVariability: Math.round(pitchVariance),
        energyRMS: parseFloat(rms.toFixed(3)),
        energyDb,
        speakingRate: parseFloat(speakingRate.toFixed(1)),
        pauseCount: Math.round(this.pauseCount / 30),
        pauseDurationMs: this.totalPauseTimeMs,
        silenceRatio: parseFloat(silenceRatio.toFixed(2)),
        jitterEstimate: parseFloat(jitterEstimate.toFixed(3)),
        spectralCentroidHz: Math.round(centroidMean),
        voiceStrainOrFatigue: strain,
        vocalArousal: arousal,
      };

      // Quality Gate
      const isDurationAdequate = durationMs >= 1200;
      const isVolumeLow = rms < 0.006;

      const quality: QualityMetrics = {
        quality: this.clippingDetected
          ? 'moderate'
          : isVolumeLow || !isDurationAdequate
          ? 'poor'
          : 'optimal',
        confidencePenalty: this.clippingDetected
          ? 0.2
          : isVolumeLow
          ? 0.4
          : !isDurationAdequate
          ? 0.3
          : 0,
        details: this.clippingDetected
          ? 'Audio clipping detected; elevated distortion'
          : isVolumeLow
          ? 'Volume too low or distance from microphone too far'
          : !isDurationAdequate
          ? 'Utterance duration under 1.2 seconds'
          : 'Clear vocal acoustic signal',
        audioVolume: Math.round(rms * 100),
        audioNoiseFloor: isSilence ? energyDb : -50,
        clippingDetected: this.clippingDetected,
        durationMs,
      };

      const signal = interpretVoiceAcoustics(features, quality, this.personalBaseline);

      const analysis: VocalStressAnalysis = {
        stressLevel:
          strain === 'elevated' || arousal === 'agitated'
            ? 'high'
            : strain === 'moderate' || arousal === 'flat_monotone'
            ? 'moderate'
            : 'low',
        lowEnergyLevel:
          arousal === 'flat_monotone' || silenceRatio > 0.45 ? 'moderate' : 'normal',
        agitationLevel: arousal === 'agitated' ? 'high' : 'calm',
        features,
        confidence: signal.confidence,
        audioQuality: quality,
        timestamp: now,
      };

      // Real visualizer waveform levels
      const levels: number[] = [];
      const stepSize = Math.floor(freqBuffer.length / 16);
      for (let i = 0; i < 16; i++) {
        levels.push(freqBuffer[i * stepSize] / 255);
      }

      this.onSnapshotUpdate?.({
        features,
        quality,
        signal,
        analysis,
        audioLevels: levels,
      });

      this.animFrameId = requestAnimationFrame(step);
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  private estimatePitch(buffer: Float32Array, sampleRate: number): number {
    const SIZE = buffer.length;
    let sum = 0;
    for (let i = 0; i < SIZE; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / SIZE);
    if (rms < 0.015) return -1;

    let r1 = 0,
      r2 = SIZE - 1;
    const thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) {
      if (Math.abs(buffer[i]) < thres) {
        r1 = i;
        break;
      }
    }
    for (let i = 1; i < SIZE / 2; i++) {
      if (Math.abs(buffer[SIZE - i]) < thres) {
        r2 = SIZE - i;
        break;
      }
    }

    const trimmed = buffer.slice(r1, r2);
    const c = new Float32Array(trimmed.length);
    for (let i = 0; i < trimmed.length; i++) {
      for (let j = 0; j < trimmed.length - i; j++) {
        c[i] = c[i] + trimmed[j] * trimmed[j + i];
      }
    }

    let d = 0;
    while (c[d] > c[d + 1]) d++;
    let maxval = -1,
      maxpos = -1;
    for (let i = d; i < trimmed.length; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    const T0 = maxpos;
    if (T0 > 0) {
      return sampleRate / T0;
    }
    return -1;
  }

  public async stop(): Promise<{
    transcript: string;
    blob: Blob | null;
    serverSTTUsed: boolean;
    acousticObservation?: string;
    errorNotice?: string;
  }> {
    this.isRunning = false;
    this.onStateChange?.('processing', 'Finalizing speech and analyzing acoustics...');

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.recognition = null;
    }

    // Stop MediaRecorder cleanly and collect Blob
    let finalBlob: Blob | null = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        if (this.mediaRecorder.state === 'recording') {
          try {
            this.mediaRecorder.requestData();
          } catch (_) {}
        }
        await new Promise<void>((resolve) => {
          if (!this.mediaRecorder) return resolve();
          this.mediaRecorder.onstop = () => {
            finalBlob = new Blob(this.audioChunks, { type: this.recordedMimeType });
            this.recordedBlob = finalBlob;
            resolve();
          };
          this.mediaRecorder.stop();
        });
      } catch (err) {
        console.warn('MediaRecorder stop note:', err);
      }
    } else if (this.audioChunks.length > 0) {
      finalBlob = new Blob(this.audioChunks, { type: this.recordedMimeType });
      this.recordedBlob = finalBlob;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close();
      } catch (_) {}
      this.audioCtx = null;
    }

    let finalTranscript = this.currentTranscript.trim();
    let serverSTTUsed = false;

    // Dual STT fallback: If client speech recognition did not capture words, use /api/transcribe
    if (!finalTranscript && finalBlob && (finalBlob as Blob).size > 1000) {
      try {
        const base64Audio = await this.blobToBase64(finalBlob);
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Audio,
            mimeType: this.recordedMimeType,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            finalTranscript = data.transcript.trim();
            serverSTTUsed = true;
          }
        }
      } catch (err) {
        console.warn('Server transcription note:', err);
      }
    }

    // Honest observation: if no words could be transcribed, report truthfully
    // NEVER invent fake words like "I'm speaking to you right now"
    let acousticObservation: string | undefined = undefined;
    if (!finalTranscript) {
      const avgEnergy =
        this.energySamples.length > 0
          ? this.energySamples.reduce((a, b) => a + b, 0) / this.energySamples.length
          : 0;

      if (avgEnergy > 0.02) {
        acousticObservation =
          'Vocal acoustics were detected, but no clear speech words were recognized. Please speak closer to your mic or type your thoughts.';
      } else {
        acousticObservation =
          'Audio was quiet. Please check your microphone input level or speak a bit louder.';
      }
    } else {
      acousticObservation = serverSTTUsed
        ? 'Speech transcribed via server acoustic model.'
        : 'Speech transcribed live via speech recognition.';
    }

    this.onStateChange?.('idle');
    this.currentTranscript = '';

    return {
      transcript: finalTranscript,
      blob: finalBlob,
      serverSTTUsed,
      acousticObservation,
    };
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
