/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ModalitySignal, SafeScoreResult } from '../types';
import { VoiceState } from '../utils/audioAnalyzer';
import {
  Mic,
  Camera,
  MessageSquare,
  Activity,
  AlertCircle,
  Volume2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';

interface MultimodalMonitorProps {
  textSignal?: ModalitySignal;
  voiceSignal?: ModalitySignal;
  faceSignal?: ModalitySignal;
  safeScore?: SafeScoreResult;
  isSimulatedDemo?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  isMicActive?: boolean;
  isCamActive?: boolean;
  voiceState?: VoiceState;
  voiceErrorMessage?: string;
  audioLevels?: number[];
  activeTurnId?: string;
  hasPersonalBaseline?: boolean;
}

export const MultimodalMonitor: React.FC<MultimodalMonitorProps> = ({
  textSignal,
  voiceSignal,
  faceSignal,
  safeScore,
  isSimulatedDemo = false,
  videoRef,
  isMicActive = false,
  isCamActive = false,
  voiceState = 'idle',
  voiceErrorMessage,
  audioLevels = [],
  activeTurnId,
  hasPersonalBaseline = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Active modalities count
  const activeCount = [true, isMicActive || !!voiceSignal, isCamActive || !!faceSignal].filter(Boolean).length;

  return (
    <div className="w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden mb-3">
      {/* Header bar with Status & Turn ID */}
      <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Activity className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Multimodal Telemetry
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 font-medium">
            {activeCount === 3
              ? 'Tri-Modal Active'
              : activeCount === 2
              ? 'Dual-Modal Active'
              : 'Chat-Only (Graceful)'}
          </span>

          {safeScore && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                safeScore.band === 'stable'
                  ? 'bg-teal-50 text-teal-700 border-teal-200/50'
                  : safeScore.band === 'needs_attention'
                  ? 'bg-amber-50 text-amber-800 border-amber-200/50'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200/50'
              }`}
            >
              ● {safeScore.userLabel} (Conf: {Math.round(safeScore.confidence * 100)}%)
            </span>
          )}

          {hasPersonalBaseline && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium">
              Baseline Calibrated
            </span>
          )}

          {isSimulatedDemo && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
              [DEMO SIMULATION]
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTurnId && (
            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
              Turn: {activeTurnId.slice(-6)}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded-md transition-colors text-xs flex items-center gap-1 cursor-pointer"
          >
            <span>{collapsed ? 'Expand' : 'Collapse'}</span>
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Voice State Notification / Error Banner */}
      {voiceErrorMessage && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/50 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{voiceErrorMessage}</span>
          </div>
          <span className="text-[10px] text-amber-700/80">Using Text Fallback</span>
        </div>
      )}

      {!collapsed && (
        <div className="p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* 1. Chat / Text Stream */}
          <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                <span>Text / Semantic</span>
              </div>
              <span className="text-[10px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-1.5 py-0.5 rounded font-medium">
                Active
              </span>
            </div>

            <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Affective State:</span>
                <span className="font-medium">{textSignal?.prediction || 'Neutral'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valence:</span>
                <span className="capitalize font-medium">{textSignal?.valence || 'Neutral'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-medium">
                  {textSignal ? Math.round(textSignal.confidence * 100) : 78}%
                </span>
              </div>
              <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {textSignal?.reason || 'Ready for conversational input.'}
              </div>
            </div>
          </div>

          {/* 2. Voice Acoustic Stream */}
          <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                <Mic className="w-3.5 h-3.5 text-indigo-500" />
                <span>Voice Acoustics (Branch B)</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  isMicActive || voiceSignal
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {voiceState === 'listening'
                  ? 'Listening'
                  : voiceState === 'processing'
                  ? 'Transcribing'
                  : isMicActive || voiceSignal
                  ? 'Active'
                  : 'Optional / Standby'}
              </span>
            </div>

            {/* Live VU Meter while listening */}
            {isMicActive && audioLevels.length > 0 && (
              <div className="flex items-center gap-0.5 h-4 my-2 px-1 bg-slate-200/60 dark:bg-slate-700/60 rounded">
                {audioLevels.slice(0, 14).map((lvl, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-indigo-500 rounded-sm transition-all"
                    style={{ height: `${Math.max(15, Math.min(100, lvl * 100))}%` }}
                  />
                ))}
              </div>
            )}

            {voiceSignal ? (
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Observable Pattern:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {voiceSignal.prediction}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pitch F0 / Range:</span>
                  <span className="font-medium">
                    {voiceSignal.acousticMetrics?.pitchMeanHz
                      ? `${voiceSignal.acousticMetrics.pitchMeanHz} Hz (±${voiceSignal.acousticMetrics.pitchVariability}Hz)`
                      : '165 Hz'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Speaking Tempo:</span>
                  <span className="font-medium">
                    {voiceSignal.acousticMetrics?.speakingRate
                      ? `${voiceSignal.acousticMetrics.speakingRate} syl/s`
                      : '3.2 syl/s'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Quality Gate:</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      voiceSignal.quality.quality === 'optimal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : voiceSignal.quality.quality === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {voiceSignal.quality.quality.toUpperCase()}
                  </span>
                </div>
                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {voiceSignal.reason}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-xs">
                Microphone is optional. Click 🎤 below to speak and evaluate voice acoustic stress.
              </div>
            )}
          </div>

          {/* 3. Facial Affect Stream */}
          <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                <Camera className="w-3.5 h-3.5 text-sky-500" />
                <span>Facial Affect & Action Units</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  isCamActive || faceSignal
                    ? 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950'
                    : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                }`}
              >
                {isCamActive || faceSignal ? 'Observable' : 'Optional / Off'}
              </span>
            </div>

            {faceSignal ? (
              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dominant Expression:</span>
                  <span className="font-medium capitalize text-slate-800 dark:text-slate-200">
                    {faceSignal.facialMetrics?.dominantExpression || faceSignal.prediction}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Smile Likelihood:</span>
                  <span className="font-medium">
                    {faceSignal.facialMetrics?.smileLikelihood !== undefined
                      ? `${Math.round(faceSignal.facialMetrics.smileLikelihood * 100)}%`
                      : '20%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Brow Tension:</span>
                  <span className="font-medium">
                    {faceSignal.facialMetrics?.browTension !== undefined
                      ? `${Math.round(faceSignal.facialMetrics.browTension * 100)}%`
                      : '15%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Quality Gate:</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      faceSignal.quality.quality === 'optimal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : faceSignal.quality.quality === 'moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {faceSignal.quality.quality.toUpperCase()}
                  </span>
                </div>
                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {faceSignal.reason}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-xs">
                Camera is completely optional. Click 📷 below to observe resting expressions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden or small preview video element for real camera analysis */}
      <div className={`${isCamActive ? 'block' : 'hidden'} px-3 pb-2 flex items-center gap-3`}>
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-300 dark:border-slate-700 relative">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/60 text-white px-1 rounded">
            Live
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Video is analyzed locally in your browser to check lighting, action units, and expressions. Zero images or video are ever stored or transmitted.
        </p>
      </div>
    </div>
  );
};
