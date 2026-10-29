/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Shield,
  UserCheck,
  Compass,
  PlayCircle,
  ChevronDown,
  Wind,
} from 'lucide-react';
import { EnvironmentTheme, AmbientSoundType, RiskLevel } from '../types';

interface NavbarProps {
  currentEnvironment: EnvironmentTheme;
  onChangeEnvironment: (env: EnvironmentTheme) => void;
  ambientSound: AmbientSoundType;
  onToggleSound: () => void;
  quietMode: boolean;
  onToggleQuietMode: () => void;
  riskLevel: RiskLevel;
  onOpenPrivacy: () => void;
  onOpenCounselor: () => void;
  onOpenDemo: () => void;
  onOpenToolkit: () => void;
  counselorEscalationActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentEnvironment,
  onChangeEnvironment,
  ambientSound,
  onToggleSound,
  quietMode,
  onToggleQuietMode,
  riskLevel,
  onOpenPrivacy,
  onOpenCounselor,
  onOpenDemo,
  onOpenToolkit,
  counselorEscalationActive = false,
}) => {
  const [showEnvMenu, setShowEnvMenu] = useState(false);

  const environments: { id: EnvironmentTheme; label: string; icon: string }[] = [
    { id: 'ocean', label: 'Ocean Waves', icon: '🌊' },
    { id: 'nature', label: 'Nature Breeze', icon: '🌿' },
    { id: 'night', label: 'Night Sky', icon: '🌌' },
    { id: 'cloud', label: 'Soft Clouds', icon: '☁️' },
    { id: 'sunset', label: 'Sunset Horizon', icon: '🌅' },
  ];

  // User-facing calm status badge (never alarming scores)
  const statusBadge = {
    low: {
      text: 'Stable Space',
      dot: 'bg-teal-500',
      badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/50',
    },
    moderate: {
      text: 'Needs Gentle Attention',
      dot: 'bg-amber-500',
      badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/50',
    },
    high: {
      text: 'Counselor Support Recommended',
      dot: 'bg-indigo-500 animate-pulse',
      badge: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/50',
    },
  }[riskLevel];

  return (
    <header className="w-full bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 sticky top-0 z-30 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <span className="font-semibold text-base tracking-tighter">CB</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                CalmBridge
              </span>
              <span className="hidden sm:inline text-[10px] uppercase font-bold tracking-widest text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-200/40 dark:border-teal-800/40">
                Safety-First
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 leading-none mt-0.5">
              Multimodal Emotional Support
            </p>
          </div>
        </div>

        {/* User-facing status indicator */}
        <div className="hidden lg:flex items-center">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${statusBadge.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
            <span>{statusBadge.text}</span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Environment Selector */}
          <div className="relative">
            <button
              onClick={() => setShowEnvMenu(!showEnvMenu)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Change space atmosphere"
            >
              <span>
                {environments.find((e) => e.id === currentEnvironment)?.icon || '🌊'}
              </span>
              <span className="hidden sm:inline text-[11px] font-medium capitalize">
                {currentEnvironment}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showEnvMenu && (
              <div className="absolute right-0 mt-1 w-44 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs space-y-0.5">
                <span className="text-[10px] text-slate-400 px-2 py-1 block font-semibold uppercase tracking-wider">
                  Choose Your Space
                </span>
                {environments.map((env) => (
                  <button
                    key={env.id}
                    onClick={() => {
                      onChangeEnvironment(env.id);
                      setShowEnvMenu(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg text-left flex items-center gap-2 transition-colors cursor-pointer ${
                      currentEnvironment === env.id
                        ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{env.icon}</span>
                    <span>{env.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ambient Soundscape Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              ambientSound !== 'off'
                ? 'border-teal-400 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={ambientSound !== 'off' ? `Ambient sound: ${ambientSound}` : 'Turn on soothing ambient sound'}
          >
            {ambientSound !== 'off' ? (
              <Volume2 className="w-4 h-4 text-teal-600" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Quiet Mode Toggle 🌙 */}
          <button
            onClick={onToggleQuietMode}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              quietMode
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Quiet Mode: minimal motion, conversation focus"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Wellness Toolkit */}
          <button
            onClick={onOpenToolkit}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Wellness toolkit (breathing, grounding, routines)"
          >
            <Wind className="w-4 h-4 text-teal-600" />
          </button>

          {/* Privacy Center */}
          <button
            onClick={onOpenPrivacy}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Privacy Center & Permissions"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Counselor Portal Toggle */}
          <button
            onClick={onOpenCounselor}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              counselorEscalationActive
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 animate-pulse'
                : 'border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title="Counselor triage portal"
          >
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Counselor Portal</span>
          </button>

          {/* Demo Mode Button */}
          <button
            onClick={onOpenDemo}
            className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            title="Hackathon Demo Lab"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Lab</span>
          </button>
        </div>
      </div>
    </header>
  );
};
