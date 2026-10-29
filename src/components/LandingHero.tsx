/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Heart,
  ArrowRight,
  Eye,
  Mic,
  Camera,
  Users,
  AlertTriangle,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { CalmOrb } from './CalmOrb';

interface LandingHeroProps {
  onEnterApp: () => void;
  onOpenDemo: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterApp,
  onOpenDemo,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 text-center select-none animate-fadeIn">
      {/* Calm Companion Orb in Hero */}
      <div className="mb-6 flex justify-center">
        <CalmOrb state="idle" size="md" label="CalmBridge Presence" />
      </div>

      {/* Main Title & Tagline */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-200/60 dark:border-teal-800/60">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Safety-First Multimodal Emotional Support</span>
      </div>

      <h1 className="text-3xl md:text-5xl font-light text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
        A safe space to talk, reflect, <br className="hidden md:inline" />
        <span className="font-medium text-teal-800 dark:text-teal-400">
          and find support.
        </span>
      </h1>

      <p className="mt-4 text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
        "AI for the first conversation. Humans for the care that matters."
      </p>

      <p className="mt-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
        CalmBridge combines conversational AI with optional voice and facial-affect signals to provide supportive conversations, noticing when signals diverge, and connecting you with real human support whenever needed.
      </p>

      {/* Primary Action Buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onEnterApp}
          className="px-6 py-3 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm shadow-lg shadow-teal-700/20 hover:shadow-teal-700/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Enter Your Space</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="px-5 py-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>How It Works</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showHowItWorks ? 'rotate-180' : ''}`}
          />
        </button>

        <button
          onClick={onOpenDemo}
          className="px-5 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-200 border border-amber-300/50 dark:border-amber-800 font-medium text-sm transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Interactive Demo Lab</span>
        </button>
      </div>

      {/* How It Works 6-Step Flow */}
      {showHowItWorks && (
        <div className="mt-10 p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-left shadow-lg">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 text-center">
            How CalmBridge Works (The 6 Stages)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-teal-600 mb-1 block">01 · Talk</span>
              <p className="text-slate-600 dark:text-slate-300">
                You share what's on your mind through chat or voice. The conversation is private and unhurried.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-teal-600 mb-1 block">02 · Multimodal Listening</span>
              <p className="text-slate-600 dark:text-slate-300">
                AI analyzes text sentiment, speech acoustic patterns, and optional facial affect in your browser.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-teal-600 mb-1 block">03 · Confidence & Quality</span>
              <p className="text-slate-600 dark:text-slate-300">
                Noisy audio or poor lighting is detected and down-weighted so false assumptions are avoided.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-teal-600 mb-1 block">04 · Consistency Analysis</span>
              <p className="text-slate-600 dark:text-slate-300">
                If words say "I'm fine" but voice signals show exhaustion, CalmBridge gently checks in with care.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-teal-600 mb-1 block">05 · Adaptive Support</span>
              <p className="text-slate-600 dark:text-slate-300">
                AI offers empathetic reflections, grounding tools, or simply listens without unsolicited advice.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs font-bold text-teal-600 mb-1 block">06 · Human Safety Escalation</span>
              <p className="text-slate-600 dark:text-slate-300">
                If explicit crisis language appears, safety overrides AI and connects you with trained human help.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Safety Section */}
      <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800 text-left">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 text-center uppercase tracking-wider text-[11px]">
          Our Trust & Safety Commitments
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <Lock className="w-4 h-4 text-teal-600 mx-auto mb-1.5" />
            <span className="font-medium text-slate-700 dark:text-slate-300 block">Privacy First</span>
            <span className="text-[10px] text-slate-400">Zero raw video saved</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <Mic className="w-4 h-4 text-indigo-500 mx-auto mb-1.5" />
            <span className="font-medium text-slate-700 dark:text-slate-300 block">Voice Optional</span>
            <span className="text-[10px] text-slate-400">Chat works alone</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <Camera className="w-4 h-4 text-sky-500 mx-auto mb-1.5" />
            <span className="font-medium text-slate-700 dark:text-slate-300 block">Camera Optional</span>
            <span className="text-[10px] text-slate-400">Disabled by default</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1.5" />
            <span className="font-medium text-slate-700 dark:text-slate-300 block">No Diagnosis</span>
            <span className="text-[10px] text-slate-400">Support, not medicine</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <Users className="w-4 h-4 text-purple-600 mx-auto mb-1.5" />
            <span className="font-medium text-slate-700 dark:text-slate-300 block">Humans in Safety</span>
            <span className="text-[10px] text-slate-400">Always accessible</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
            <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto mb-1.5" />
            <span className="font-medium text-slate-700 dark:text-slate-300 block">AI Can Be Wrong</span>
            <span className="text-[10px] text-slate-400">User is the authority</span>
          </div>
        </div>

        {/* Judge-Facing Innovation Statement */}
        <div className="mt-8 p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-center max-w-3xl mx-auto">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Architectural Note for Judges:
          </span>{' '}
          CalmBridge does not assume that one signal tells the complete emotional story. It combines what a person says, how they speak, and optional facial-affect signals, weighs each by confidence and quality, and when these signals disagree it gently checks in rather than assuming. When a serious safety signal appears, it never relies on AI alone — it brings in a human.
        </div>
      </div>
    </div>
  );
};
