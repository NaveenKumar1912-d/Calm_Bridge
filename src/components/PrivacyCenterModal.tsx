/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  Lock,
  Mic,
  Camera,
  Eye,
  Trash2,
  X,
  Check,
  HelpCircle,
} from 'lucide-react';
import { UserPreferences } from '../types';

interface PrivacyCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onClearSession: () => void;
}

export const PrivacyCenterModal: React.FC<PrivacyCenterModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onClearSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Data Sovereign & Private
              </span>
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
                Your Privacy Center
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          {/* Privacy guarantees badge */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60 text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-semibold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-600" />
              <span>Zero Raw Video or Audio Retention</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              Your camera frames and microphone audio streams are processed ephemeral and locally in your browser memory via Web Audio & Canvas APIs. No audio recordings or video files are ever uploaded, stored, or sold.
            </p>
          </div>

          {/* Granular Toggles */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">
              Permission Controls
            </h4>

            {/* Mic Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Microphone Input (Voice Analysis)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Analyzes vocal energy, pauses, and speech-to-text.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdatePreferences({ micEnabled: !preferences.micEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  preferences.micEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                    preferences.micEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Camera Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Camera Input (Facial Affect Analysis)
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Analyzes observable smile curvature and brow tension. Optional.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdatePreferences({ cameraEnabled: !preferences.cameraEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  preferences.cameraEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                    preferences.cameraEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Multimodal Analysis Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    Cross-Modal Consistency Engine
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Compares verbal vs vocal/affect signals to check in gently.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    multimodalAnalysisEnabled: !preferences.multimodalAnalysisEnabled,
                  })
                }
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  preferences.multimodalAnalysisEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                    preferences.multimodalAnalysisEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Clear Session Data */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Delete all messages, notes, and local session memory?')) {
                  onClearSession();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 flex items-center justify-center gap-2 font-medium cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Session & Local Cache</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
