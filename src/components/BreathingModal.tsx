/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Play, RotateCcw } from 'lucide-react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

export const BreathingModal: React.FC<BreathingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPhase('inhale');
      setSecondsLeft(4);
      setCyclesCompleted(0);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transition between phases (4s inhale -> 2s hold -> 4s exhale)
        if (phase === 'inhale') {
          setPhase('hold');
          return 2;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return 4;
        } else {
          // exhale finished
          setCyclesCompleted((c) => c + 1);
          setPhase('inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, phase]);

  if (!isOpen) return null;

  const phaseInstruction = {
    inhale: {
      text: 'Inhale gently through your nose...',
      scale: 'scale-125',
      color: 'text-teal-600 dark:text-teal-400',
      bgGlow: 'bg-teal-200/50 dark:bg-teal-900/40',
    },
    hold: {
      text: 'Pause and rest here...',
      scale: 'scale-125',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgGlow: 'bg-indigo-200/50 dark:bg-indigo-900/40',
    },
    exhale: {
      text: 'Slowly release through your mouth...',
      scale: 'scale-90',
      color: 'text-sky-600 dark:text-sky-400',
      bgGlow: 'bg-sky-200/50 dark:bg-sky-900/40',
    },
  }[phase];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center relative overflow-hidden">
        {/* Close / Skip button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          title="Close or Skip"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest text-teal-600 dark:text-teal-400 font-semibold">
            Breathing Space
          </span>
          <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mt-1">
            4 · 2 · 4 Resonant Pacing
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Give yourself a quiet pause. You can stop or continue whenever you wish.
          </p>
        </div>

        {/* Dynamic Breathing Circle */}
        <div className="my-10 flex items-center justify-center relative h-52">
          {/* Outer gentle ambient pulse */}
          <div
            className={`absolute w-44 h-44 rounded-full ${phaseInstruction.bgGlow} blur-2xl transition-all duration-1000 ${phaseInstruction.scale}`}
          />

          {/* Central expanding circle */}
          <div
            className={`w-40 h-40 rounded-full border-2 border-teal-300 dark:border-teal-700/60 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80 shadow-inner transition-transform duration-1000 ease-in-out ${phaseInstruction.scale}`}
          >
            <span className={`text-4xl font-light ${phaseInstruction.color}`}>
              {secondsLeft}s
            </span>
            <span className="text-xs uppercase font-medium tracking-wider text-slate-400 mt-1">
              {phase}
            </span>
          </div>
        </div>

        <p className={`text-sm font-medium ${phaseInstruction.color} min-h-[1.5rem]`}>
          {phaseInstruction.text}
        </p>

        <div className="mt-6 text-xs text-slate-400">
          Cycle: {cyclesCompleted + 1}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <button
            onClick={() => {
              onComplete?.();
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            I feel ready to talk
          </button>
        </div>
      </div>
    </div>
  );
};
