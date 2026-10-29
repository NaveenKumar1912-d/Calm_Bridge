/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConsistencyAnalysis, SafetyAssessment, ModalitySignal } from '../types';
import {
  ShieldAlert,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';

interface CrossModalConsistencyCardProps {
  consistency?: ConsistencyAnalysis;
  safety?: SafetyAssessment;
  signals?: {
    text?: ModalitySignal;
    voice?: ModalitySignal;
    face?: ModalitySignal;
  };
  onDismissFollowUp?: () => void;
}

export const CrossModalConsistencyCard: React.FC<CrossModalConsistencyCardProps> = ({
  consistency,
  safety,
  signals,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!consistency && !safety) return null;

  const isDivergence = consistency?.status === 'disagree';
  const isHighRisk = safety?.riskLevel === 'high';

  return (
    <div className="w-full my-2 rounded-2xl border transition-all duration-300 text-sm overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* 1. High Risk Safety Override Banner */}
      {isHighRisk && (
        <div className="bg-amber-500/15 border-b border-amber-300/40 p-3.5 flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold flex items-center gap-2">
              <span>Safety Priority Active</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                Override Priority
              </span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
              {safety?.triggerReason || 'Immediate human support resources are prioritized.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. Consistency Analysis Bar */}
      <div className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isDivergence
                ? 'bg-amber-500 animate-pulse'
                : consistency?.status === 'agree'
                ? 'bg-teal-500'
                : consistency?.status === 'partially_agree'
                ? 'bg-sky-500'
                : 'bg-slate-400'
            }`}
          />
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span>
                {consistency?.status === 'disagree'
                  ? 'Possible Signal Divergence Noted'
                  : consistency?.status === 'agree'
                  ? 'Signals Aligned'
                  : consistency?.status === 'partially_agree'
                  ? 'Nuanced Expression'
                  : 'Active Channel: Clear Dialogue'}
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isDivergence
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                }`}
              >
                {consistency?.status === 'disagree' ? 'Gentle Follow-up' : 'Balanced'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {consistency?.description || 'Evaluating verbal and acoustic signals.'}
            </p>
          </div>
        </div>

        {/* Quick Modal Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {signals?.text && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              💬 Text: {signals.text.prediction} ({Math.round(signals.text.confidence * 100)}%)
            </span>
          )}
          {signals?.voice && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-md ${
                signals.voice.quality.quality === 'poor'
                  ? 'bg-slate-100 text-slate-400'
                  : signals.voice.valence === 'negative'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200/50'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              🎤 Voice: {signals.voice.prediction}
            </span>
          )}
          {signals?.face && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              📷 Face: {signals.face.prediction}
            </span>
          )}

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-900 flex items-center gap-1 ml-1 cursor-pointer font-medium"
            title="Why CalmBridge checked in"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why check in?</span>
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 3. Expandable Transparent Explainable AI Section */}
      {showExplanation && (
        <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 p-3.5 text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                CalmBridge Explainability & Humility
              </p>
              <p className="mt-0.5 text-slate-600 dark:text-slate-400 leading-relaxed">
                {safety?.explainableSummary ||
                  consistency?.explanation ||
                  'CalmBridge notices differences between words and acoustic/facial signals. Because algorithms can never know internal feelings, it gently checks in rather than making assumptions.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-medium">Text Analysis</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {signals?.text?.reason || 'Clear conversational tone'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-medium">Vocal Acoustics</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {signals?.voice?.reason || 'Awaiting or optional voice input'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-400 block font-medium">Facial Affect</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                {signals?.face?.reason || 'Camera optional; not engaged'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              CalmBridge never claims to read minds or detect hidden lies. You are the ultimate authority on how you feel.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
