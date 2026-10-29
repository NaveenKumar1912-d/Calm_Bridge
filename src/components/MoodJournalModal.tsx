/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calendar, Sparkles, Check } from 'lucide-react';

interface MoodJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEntry?: (entry: any) => void;
}

export const MoodJournalModal: React.FC<MoodJournalModalProps> = ({
  isOpen,
  onClose,
  onSaveEntry,
}) => {
  const [selectedMood, setSelectedMood] = useState('Okay');
  const [stress, setStress] = useState<'Mild' | 'Moderate' | 'Heavy'>('Mild');
  const [energy, setEnergy] = useState<'Low' | 'Balanced' | 'High'>('Balanced');
  const [note, setNote] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const moods = [
    { label: 'Okay', icon: '🙂' },
    { label: 'Low', icon: '😔' },
    { label: 'Anxious', icon: '😰' },
    { label: 'Frustrated', icon: '😤' },
    { label: 'Drained', icon: '😴' },
    { label: 'Need Support', icon: '🫶' },
  ];

  const handleSave = () => {
    onSaveEntry?.({
      date: new Date().toLocaleDateString(),
      mood: selectedMood,
      stress,
      energy,
      note,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Personal Space
            </span>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
              Mood Check-in & Journey
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 space-y-4 text-xs">
          {/* 1. Quick Emotion Selection */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1.5">
              How does right now feel?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {moods.map((m) => (
                <button
                  key={m.label}
                  type="button"
                  onClick={() => setSelectedMood(m.label)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedMood === m.label
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="text-lg block mb-0.5">{m.icon}</span>
                  <span className="text-[11px]">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Stress & Energy Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Stress Level
              </label>
              <div className="flex gap-1">
                {(['Mild', 'Moderate', 'Heavy'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setStress(lvl)}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                      stress === lvl
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 text-teal-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                Energy Level
              </label>
              <div className="flex gap-1">
                {(['Low', 'Balanced', 'High'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergy(lvl)}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                      energy === lvl
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Short reflection note */}
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
              Private Note (Optional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What made today feel this way?"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none text-xs"
            />
          </div>

          {/* 4. Non-medical Emotional Journey Preview */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-2">
              <span>Recent Journey</span>
              <span className="text-teal-600 font-normal">Non-clinical view</span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <div className="text-center">
                <span className="text-base block">😐</span>
                <span className="text-[10px] text-slate-400">Mon</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="text-center">
                <span className="text-base block">😰</span>
                <span className="text-[10px] text-slate-400">Tue</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="text-center">
                <span className="text-base block">😔</span>
                <span className="text-[10px] text-slate-400">Wed</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="text-center">
                <span className="text-base block">🙂</span>
                <span className="text-[10px] text-slate-400">Thu</span>
              </div>
              <span className="text-slate-300">→</span>
              <div className="text-center">
                <span className="text-base block">🌱</span>
                <span className="text-[10px] text-teal-600 font-medium">Today</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Gentle trend: More difficult ─ Stable ─ Improving
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savedSuccess}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved Gently</span>
              </>
            ) : (
              'Save to Your Space'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
