/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type OrbState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'distressed'
  | 'counselor';

interface CalmOrbProps {
  state: OrbState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const CalmOrb: React.FC<CalmOrbProps> = ({
  state,
  onClick,
  size = 'md',
  label,
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28 md:w-32 md:h-32',
    lg: 'w-40 h-40 md:w-48 md:h-48',
  };

  // Calm color palettes by state
  const colorConfig = {
    idle: {
      gradient: 'from-teal-300/40 via-cyan-200/30 to-indigo-200/40',
      ring: 'border-teal-300/30',
      glow: 'shadow-[0_0_40px_rgba(168,199,193,0.35)]',
      pulseSpeed: 'animate-[pulse_5s_ease-in-out_infinite]',
      statusText: 'Present & Listening',
    },
    listening: {
      gradient: 'from-emerald-300/50 via-teal-300/40 to-cyan-300/40',
      ring: 'border-emerald-400/40',
      glow: 'shadow-[0_0_50px_rgba(52,211,153,0.4)]',
      pulseSpeed: 'animate-[pulse_2.5s_ease-in-out_infinite]',
      statusText: 'Listening attentively',
    },
    thinking: {
      gradient: 'from-indigo-300/45 via-purple-300/35 to-teal-200/35',
      ring: 'border-indigo-400/40',
      glow: 'shadow-[0_0_45px_rgba(165,180,252,0.4)]',
      pulseSpeed: 'animate-[spin_8s_linear_infinite]',
      statusText: 'Reflecting gently',
    },
    speaking: {
      gradient: 'from-cyan-300/50 via-teal-400/40 to-sky-300/45',
      ring: 'border-cyan-400/50',
      glow: 'shadow-[0_0_55px_rgba(34,211,238,0.45)]',
      pulseSpeed: 'animate-[pulse_2s_ease-in-out_infinite]',
      statusText: 'Speaking with you',
    },
    distressed: {
      gradient: 'from-sky-200/45 via-indigo-200/40 to-teal-100/40',
      ring: 'border-sky-300/40',
      glow: 'shadow-[0_0_45px_rgba(186,230,253,0.4)]',
      pulseSpeed: 'animate-[pulse_6s_ease-in-out_infinite]', // extra slow, calming rhythm
      statusText: 'Soothing presence',
    },
    counselor: {
      // Gentle calm amber attention - NEVER an alarming flashing red
      gradient: 'from-amber-200/50 via-orange-200/35 to-rose-200/35',
      ring: 'border-amber-300/50',
      glow: 'shadow-[0_0_45px_rgba(251,191,36,0.35)]',
      pulseSpeed: 'animate-[pulse_4s_ease-in-out_infinite]',
      statusText: 'Counselor support available',
    },
  };

  const current = colorConfig[state];

  return (
    <div className="flex flex-col items-center justify-center select-none" onClick={onClick}>
      <div className="relative flex items-center justify-center">
        {/* Outer ambient breathing halo */}
        <div
          className={`absolute rounded-full -inset-4 bg-gradient-to-tr ${current.gradient} opacity-40 blur-xl ${current.pulseSpeed} transition-all duration-1000`}
        />

        {/* Outer soft ring */}
        <div
          className={`absolute rounded-full -inset-2 border ${current.ring} opacity-60 transition-all duration-700`}
        />

        {/* Central Orb */}
        <div
          className={`${sizeMap[size]} rounded-full bg-gradient-to-tr ${current.gradient} ${current.glow} backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-700 transform hover:scale-105 active:scale-95`}
        >
          {/* Internal soft nucleus */}
          <div className="w-2/3 h-2/3 rounded-full bg-white/40 blur-sm flex items-center justify-center">
            {state === 'speaking' && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-3 bg-teal-600/60 rounded-full animate-[bounce_1s_infinite_100ms]" />
                <span className="w-1 h-5 bg-teal-600/70 rounded-full animate-[bounce_1s_infinite_200ms]" />
                <span className="w-1 h-3 bg-teal-600/60 rounded-full animate-[bounce_1s_infinite_300ms]" />
              </div>
            )}
            {state === 'thinking' && (
              <div className="w-3 h-3 rounded-full bg-indigo-500/40 animate-ping" />
            )}
            {state === 'listening' && (
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {label !== undefined && (
        <span className="mt-3 text-xs tracking-wide text-slate-500 dark:text-slate-400 font-medium">
          {label || current.statusText}
        </span>
      )}
    </div>
  );
};
