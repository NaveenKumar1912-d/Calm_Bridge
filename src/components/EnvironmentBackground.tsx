/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EnvironmentTheme } from '../types';

interface EnvironmentBackgroundProps {
  theme: EnvironmentTheme;
  quietMode: boolean;
}

export const EnvironmentBackground: React.FC<EnvironmentBackgroundProps> = ({
  theme,
  quietMode,
}) => {
  // Theme backgrounds with subtle palette
  const themeStyles = {
    ocean: {
      bg: 'bg-gradient-to-b from-[#EBF4F6] via-[#DCEEF2] to-[#CBE5EB]',
      particleColor: 'bg-teal-400/20',
      accent: 'from-cyan-200/30 via-teal-100/20 to-transparent',
    },
    nature: {
      bg: 'bg-gradient-to-b from-[#F2F7F2] via-[#E2EFE2] to-[#D5E7D5]',
      particleColor: 'bg-emerald-500/15',
      accent: 'from-emerald-200/30 via-green-100/20 to-transparent',
    },
    night: {
      bg: 'bg-gradient-to-b from-[#1C2430] via-[#222E3E] to-[#18202A]',
      particleColor: 'bg-indigo-300/25',
      accent: 'from-indigo-500/10 via-purple-500/10 to-transparent',
    },
    cloud: {
      bg: 'bg-gradient-to-b from-[#F7F8FC] via-[#ECEFF7] to-[#E3E8F4]',
      particleColor: 'bg-sky-400/20',
      accent: 'from-blue-200/25 via-indigo-100/20 to-transparent',
    },
    sunset: {
      bg: 'bg-gradient-to-b from-[#FAF4F0] via-[#F6EBE5] to-[#F0DFD7]',
      particleColor: 'bg-amber-400/20',
      accent: 'from-orange-200/25 via-rose-100/20 to-transparent',
    },
  };

  const current = themeStyles[theme] || themeStyles.ocean;

  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 transition-colors duration-1000 ${
        quietMode ? 'bg-[#F5F8FA]' : current.bg
      }`}
      aria-hidden="true"
    >
      {!quietMode && (
        <>
          {/* Soft large drifting ambient radial glows */}
          <div
            className={`absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-br ${current.accent} blur-3xl opacity-60 animate-[pulse_10s_ease-in-out_infinite]`}
          />
          <div
            className={`absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-gradient-to-tl ${current.accent} blur-3xl opacity-50 animate-[pulse_14s_ease-in-out_infinite_2s]`}
          />

          {/* Subtle floating particles */}
          <div className="absolute inset-0 overflow-hidden opacity-40">
            <span
              className={`absolute top-1/4 left-1/5 w-2 h-2 rounded-full ${current.particleColor} animate-ping duration-1000`}
            />
            <span
              className={`absolute top-2/3 left-1/3 w-3 h-3 rounded-full ${current.particleColor} animate-pulse duration-700`}
            />
            <span
              className={`absolute top-1/3 right-1/4 w-2 h-2 rounded-full ${current.particleColor} animate-pulse duration-1000`}
            />
            <span
              className={`absolute bottom-1/4 right-1/5 w-2.5 h-2.5 rounded-full ${current.particleColor} animate-ping duration-1000`}
            />
          </div>
        </>
      )}

      {/* Gentle bottom horizon line */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white/40 to-transparent pointer-events-none" />
    </div>
  );
};
