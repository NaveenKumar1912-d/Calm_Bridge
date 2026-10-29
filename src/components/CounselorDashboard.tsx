/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  Activity,
  PhoneCall,
  Clock,
  ArrowRight,
  Send,
  CheckCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Gauge,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { CounselorSession } from '../types';

interface CounselorDashboardProps {
  session: CounselorSession;
  onSendCounselorMessage: (text: string) => void;
  onResolveEscalation: () => void;
  onClose: () => void;
}

export const CounselorDashboard: React.FC<CounselorDashboardProps> = ({
  session,
  onSendCounselorMessage,
  onResolveEscalation,
  onClose,
}) => {
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'safescore' | 'transcript' | 'resources'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = () => {
    if (!noteText.trim()) return;
    setIsSubmitting(true);
    onSendCounselorMessage(noteText.trim());
    setNoteText('');
    setIsSubmitting(false);
  };

  const isHighRisk = session.userRiskLevel === 'high';
  const safeScore = session.safeScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isHighRisk ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700' : 'bg-teal-100 dark:bg-teal-950 text-teal-700'
              }`}
            >
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Counselor Escalation & Triage Portal
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ID: {session.sessionId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI for the first conversation. Humans for the care that matters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                isHighRisk
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              {session.userRiskLevel} Risk
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close View
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-3 flex gap-4 border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Multimodal Handoff & Signals
          </button>
          <button
            onClick={() => setActiveTab('safescore')}
            className={`pb-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'safescore'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            SafeScore Deep Breakdown ({safeScore ? `${safeScore.score}/100` : 'N/A'})
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`pb-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'transcript'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Turn Context & Transcript ({session.recentMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`pb-2.5 font-medium border-b-2 transition-all ${
              activeTab === 'resources'
                ? 'border-teal-600 text-teal-700 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Verified 24/7 Crisis Links
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {activeTab === 'overview' && (
            <>
              {/* Alert Reason */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    Reason for Escalation
                  </div>
                  <p className="text-amber-800/90 dark:text-amber-300 mt-0.5">
                    {session.safetyTriggers.length > 0
                      ? session.safetyTriggers.join('; ')
                      : 'Multimodal inconsistency detected with worsening emotional trajectory.'}
                  </p>
                </div>
              </div>

              {/* Status grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Trajectory</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase">
                    {session.trend}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Consistency</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
                    {session.activeConsistency?.status?.replace('_', ' ') || 'Sufficient'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">SafeScore Index</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {safeScore ? `${safeScore.score}/100 (${safeScore.userLabel})` : 'Stable'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Vocal Acoustic</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {session.latestSignals.voice?.prediction || 'No input'}
                  </span>
                </div>
              </div>

              {/* AI Generated Counselor Handoff Summary */}
              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40">
                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-semibold mb-1">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Clinical Briefing (Objective Handoff)</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                  {session.historySummary ||
                    'User engaged with possible cross-modal divergence. Spoken words indicated reassurance while vocal markers displayed fatigue and acoustic strain.'}
                </p>
                <div className="text-[11px] text-teal-700/80 dark:text-teal-400/80 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Escalated at: {new Date(session.lastUpdated).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Direct Counselor Intervention Box */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <label className="block font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Send Direct Human Message to User
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  This message will appear directly in the user's space labeled from the support counselor.
                </p>
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Hello, I'm Alex from the CalmBridge support team. I'm right here with you..."
                    className="flex-1 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isSubmitting || !noteText.trim()}
                    className="px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'safescore' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Overall SafeScore</div>
                  <div className="text-3xl font-light text-slate-900 dark:text-slate-100 mt-0.5">
                    {safeScore?.score || 80}{' '}
                    <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                  <span
                    className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      safeScore?.band === 'stable'
                        ? 'bg-teal-100 text-teal-800'
                        : safeScore?.band === 'needs_attention'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {safeScore?.userLabel || 'Stable'} (Band: {safeScore?.band})
                  </span>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div>Confidence: {Math.round((safeScore?.confidence || 0.8) * 100)}%</div>
                  <div>Trend: {session.trend.toUpperCase()}</div>
                </div>
              </div>

              {safeScore?.breakdown && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Text Distress</span>
                    <span className="text-lg font-medium text-slate-800 dark:text-slate-200">
                      -{safeScore.breakdown.textDistress} pts
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Weight: 50% | Severity penalty</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Voice Distress</span>
                    <span className="text-lg font-medium text-slate-800 dark:text-slate-200">
                      -{safeScore.breakdown.voiceDistress} pts
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Weight: 30% | Acoustic strain</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Face Distress</span>
                    <span className="text-lg font-medium text-slate-800 dark:text-slate-200">
                      -{safeScore.breakdown.faceDistress} pts
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Weight: 20% | Affect tension</p>
                  </div>
                </div>
              )}

              {/* Dynamic adjustments */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-1.5">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Dynamic Mathematical Adjustments
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Persistence Penalty (multi-turn distress):</span>
                  <span>-{safeScore?.breakdown?.persistencePenalty || 0} pts</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Trend Velocity Adjustment ({session.trend}):</span>
                  <span>{safeScore?.breakdown?.trendAdjustment || 0} pts</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Safety Override Protocol:</span>
                  <span className={safeScore?.breakdown?.safetyOverrideApplied ? 'text-amber-600 font-bold' : ''}>
                    {safeScore?.breakdown?.safetyOverrideApplied ? 'ACTIVE (< 20 cap)' : 'None'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-2.5">
              {session.recentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border ${
                    msg.sender === 'user'
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 ml-8'
                      : msg.sender === 'counselor'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900 mr-8'
                      : 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900 mr-8'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">
                      {msg.sender === 'user' ? 'User' : msg.sender === 'counselor' ? 'Counselor' : 'CalmBridge AI'}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.turn_id && <span className="font-mono">Turn: {msg.turn_id.slice(-6)}</span>}
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Verified 24/7 immediate crisis links to share with the user or activate:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    <span>988 Suicide & Crisis Lifeline</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Free, confidential, 24/7 support in the US & Canada. Call or text 988.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    <span>Crisis Text Line</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Text HOME to 741741 to connect with a crisis counselor 24/7.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    <span>Tele-MANAS & Vandrevala Foundation (India)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    National Mental Health Helpline: 14416 / 9999 666 555 (24/7 Multilingual support).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-teal-600" />
                    <span>Befrienders Worldwide</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Global network of emotional support centers in 32+ countries.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions: AI -> Human -> AI Loop */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
            <span>AI → Human → AI Loop: You can de-escalate and return session to AI support.</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onResolveEscalation}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark Reviewed & Return to AI Care</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
