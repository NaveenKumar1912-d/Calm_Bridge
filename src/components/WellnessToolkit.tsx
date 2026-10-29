/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wind,
  Compass,
  Sparkles,
  BookOpen,
  GraduationCap,
  Moon,
  Volume2,
  VolumeX,
  X,
  Check,
} from 'lucide-react';
import { AmbientSoundType } from '../types';

interface WellnessToolkitProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBreathing: () => void;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  onSelectAmbientSound: (sound: AmbientSoundType) => void;
  onChangeAmbientVolume: (vol: number) => void;
}

export const WellnessToolkit: React.FC<WellnessToolkitProps> = ({
  isOpen,
  onClose,
  onOpenBreathing,
  ambientSound,
  ambientVolume,
  onSelectAmbientSound,
  onChangeAmbientVolume,
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'grounding' | 'sound'>('tools');
  const [groundingStep, setGroundingStep] = useState(0);

  if (!isOpen) return null;

  const groundingPrompts = [
    { count: '5', sense: 'SEE', prompt: 'Look around and name 5 things you can see (a leaf, a shadow, your phone, colors).' },
    { count: '4', sense: 'TOUCH', prompt: 'Notice 4 things you can physically feel (feet on the floor, texture of clothing, cool breeze).' },
    { count: '3', sense: 'HEAR', prompt: 'Listen carefully for 3 distinct sounds (clock ticking, distant traffic, your own breath).' },
    { count: '2', sense: 'SMELL', prompt: 'Identify 2 things you can smell or scents you enjoy (coffee, fresh air, rain).' },
    { count: '1', sense: 'TASTE', prompt: 'Notice 1 taste in your mouth, or take a sip of cool fresh water.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-teal-600 dark:text-teal-400">
              Wellness Resources
            </span>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
              Supportive Toolkit
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 my-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'tools'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Wellness Practices
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'grounding'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            5-4-3-2-1 Grounding
          </button>
          <button
            onClick={() => setActiveTab('sound')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'sound'
                ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Ambient Soundscape
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-2 pr-1 space-y-3">
          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {/* Tool 1: Breathing */}
              <div
                onClick={() => {
                  onClose();
                  onOpenBreathing();
                }}
                className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60 hover:border-teal-400 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-medium text-xs mb-1">
                  <Wind className="w-4 h-4 text-teal-600" />
                  <span>Resonant Breathing</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  4-2-4 pacing to reset your nervous system when feeling tense or rushed.
                </p>
              </div>

              {/* Tool 2: Exam Stress & Study Breaks */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/60">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-medium text-xs mb-1">
                  <GraduationCap className="w-4 h-4 text-sky-600" />
                  <span>Exam Pressure Release</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Break study blocks into 25-minute sprints. Step outside for 3 minutes without screens.
                </p>
              </div>

              {/* Tool 3: 2-minute Mindfulness */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-medium text-xs mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>2-Minute Pause</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Notice whatever is in this moment without trying to push away thoughts or judge them.
                </p>
              </div>

              {/* Tool 4: Sleep & Wind-Down */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/60">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium text-xs mb-1">
                  <Moon className="w-4 h-4 text-purple-600" />
                  <span>Wind-Down Routine</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Dim lighting, write tomorrow's three priorities down to clear your mind, and hydrate.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'grounding' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xl font-bold">
                {groundingPrompts[groundingStep].count}
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-teal-600 tracking-wider">
                  Sense: {groundingPrompts[groundingStep].sense}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 max-w-sm mx-auto leading-relaxed">
                  {groundingPrompts[groundingStep].prompt}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                {groundingPrompts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setGroundingStep(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      groundingStep === idx ? 'bg-teal-600 w-6' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                {groundingStep < groundingPrompts.length - 1 ? (
                  <button
                    onClick={() => setGroundingStep((s) => s + 1)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm"
                  >
                    Next Sense
                  </button>
                ) : (
                  <button
                    onClick={() => setGroundingStep(0)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-700 text-white cursor-pointer"
                  >
                    Start over
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sound' && (
            <div className="space-y-4 text-left">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Procedurally synthesized acoustic soundscapes. Off by default, plays only while you're in Your Space.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'off', label: 'Off', icon: VolumeX },
                  { id: 'rain', label: 'Gentle Rain', icon: Volume2 },
                  { id: 'ocean', label: 'Ocean Waves', icon: Volume2 },
                  { id: 'forest', label: 'Forest Wind', icon: Volume2 },
                  { id: 'fireplace', label: 'Fireplace', icon: Volume2 },
                  { id: 'ambient', label: '432Hz Drone', icon: Volume2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = ambientSound === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectAmbientSound(item.id as AmbientSoundType)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 font-medium'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-teal-600" />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                  );
                })}
              </div>

              {ambientSound !== 'off' && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Volume</span>
                    <span>{Math.round(ambientVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVolume}
                    onChange={(e) => onChangeAmbientVolume(parseFloat(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
