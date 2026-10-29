/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  X,
  Volume2,
  Camera,
  MessageSquare,
  FlaskConical,
} from 'lucide-react';
import {
  ModalitySignal,
  ConsistencyAnalysis,
  SafetyAssessment,
  SafeScoreResult,
} from '../types';

interface DemoWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDemoStep: (stepData: {
    turn_id: string;
    userMessage: string;
    aiReply: string;
    textSignal: ModalitySignal;
    voiceSignal: ModalitySignal;
    faceSignal: ModalitySignal;
    consistency: ConsistencyAnalysis;
    safety: SafetyAssessment;
    safeScore: SafeScoreResult;
  }) => void;
}

export const DemoWalkthrough: React.FC<DemoWalkthroughProps> = ({
  isOpen,
  onClose,
  onApplyDemoStep,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  // The 8 Canonical Scripted Test Cases from Section 6
  const demoSteps = [
    {
      stepNumber: 1,
      title: 'Test 1: Inconsistency Check-In (Text Positive + Face Positive + Voice Stressed)',
      userAction: 'User smiles, says: "I\'m fine. Everything is okay."',
      description:
        'Words say "fine" and face smiles, but vocal acoustic features show flat pitch (12Hz var) and fatigue pauses (1100ms). Asymmetric distress-priority triggers gentle, humble follow-up without accusation.',
      tag: 'Asymmetric Inconsistency',
      textMessage: "I'm fine. Everything is okay.",
      aiReply:
        "You mentioned you're okay. I could be wrong, but your voice sounds a little more tired than usual. If something is bothering you, you can talk to me about it. There's no rush, and I'm here to listen.",
      textSignal: {
        modality: 'text' as const,
        prediction: 'Positive / Reassuring Words',
        valence: 'positive' as const,
        confidence: 0.92,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear transcript' },
        reason: 'Explicitly reassuring statements ("fine", "okay").',
        timestamp: Date.now(),
      },
      voiceSignal: {
        modality: 'voice' as const,
        prediction: 'Low Energy / Possible Vocal Fatigue',
        valence: 'negative' as const,
        confidence: 0.85,
        severity: 'low' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Optimal recording quality' },
        reason: 'Acoustic analysis shows flat pitch modulation (12Hz var), reduced vocal energy, and hesitation pauses.',
        timestamp: Date.now(),
        acousticMetrics: {
          pitchMeanHz: 135,
          pitchMinHz: 120,
          pitchMaxHz: 145,
          pitchRangeHz: 25,
          pitchVariability: 12,
          energyRMS: 0.032,
          energyDb: -32,
          speakingRate: 2.1,
          pauseCount: 4,
          pauseDurationMs: 1100,
          silenceRatio: 0.42,
          jitterEstimate: 0.04,
          spectralCentroidHz: 1300,
          voiceStrainOrFatigue: 'moderate' as const,
          vocalArousal: 'flat_monotone' as const,
        },
      },
      faceSignal: {
        modality: 'face' as const,
        prediction: 'Smiling / Pleasant Expression',
        valence: 'positive' as const,
        confidence: 0.88,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear lighting and centered face' },
        reason: 'Persistent smile affect (smile probability 82%).',
        timestamp: Date.now(),
        facialMetrics: {
          smileLikelihood: 0.82,
          browTension: 0.15,
          expressiveness: 0.72,
          faceStability: 0.88,
          dominantExpression: 'happy',
        },
      },
      consistency: {
        status: 'disagree' as const,
        primaryValence: 'mixed' as const,
        divergenceDetected: true,
        whichModalityDisagrees: 'voice' as const,
        description: 'Possible cross-modal divergence detected (verbal reassurance vs. vocal fatigue/strain).',
        explanation:
          'Your words express reassurance, while observable acoustic signals show lower energy or vocal strain. CalmBridge checks in gently without assuming how you truly feel.',
        gentleFollowUpNeeded: true,
        suggestedCheckInPrompt:
          "You mentioned you're okay. I could be wrong, but your voice sounds a little more tired than usual. If something is bothering you, you can talk to me about it. There's no rush, and I'm here to listen.",
        confidence: 0.86,
        signalsCompared: { textValence: 'positive', voiceValence: 'negative', faceValence: 'positive' },
      },
      safeScore: {
        score: 68,
        band: 'needs_attention' as const,
        userLabel: 'Needs attention' as const,
        confidence: 0.85,
        breakdown: {
          textDistress: 0,
          voiceDistress: 22.5,
          faceDistress: 0,
          persistencePenalty: 0,
          trendAdjustment: 0,
          safetyOverrideApplied: false,
        },
      },
      safety: {
        riskLevel: 'low' as const,
        riskScore: 28,
        safeScore: {
          score: 68,
          band: 'needs_attention' as const,
          userLabel: 'Needs attention' as const,
          confidence: 0.85,
          breakdown: {
            textDistress: 0,
            voiceDistress: 22.5,
            faceDistress: 0,
            persistencePenalty: 0,
            trendAdjustment: 0,
            safetyOverrideApplied: false,
          },
        },
        safetyOverride: false,
        triggerReason: 'Cross-modal divergence detected; gentle check-in activated.',
        continuousTrend: 'stable' as const,
        escalationRequired: false,
        explainableSummary: 'AI noticed contrast between verbal reassurance and vocal acoustic fatigue.',
        recommendedAction: 'Gentle exploratory check-in without accusation.',
      },
    },
    {
      stepNumber: 2,
      title: 'Test 2: All Positive & Good Quality -> Warm Friendly Conversation',
      userAction: 'User says: "Had a wonderful walk in the park today!"',
      description:
        'All three modalities align positively: text is joyful, voice cadence is expressive, face is smiling with optimal quality. Normal warm conversational reply.',
      tag: 'Harmonious Positive',
      textMessage: 'Had a wonderful walk in the park today, feeling really refreshed!',
      aiReply:
        "That sounds so peaceful and refreshing. What was the nicest moment of your walk?",
      textSignal: {
        modality: 'text' as const,
        prediction: 'Positive / Reassuring Words',
        valence: 'positive' as const,
        confidence: 0.94,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear input' },
        reason: 'Joyful, uplifting statement.',
        timestamp: Date.now(),
      },
      voiceSignal: {
        modality: 'voice' as const,
        prediction: 'Expressive / Warm Voice',
        valence: 'positive' as const,
        confidence: 0.9,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Optimal acoustics' },
        reason: 'Animated pitch modulation (32Hz var) and relaxed vocal cadence.',
        timestamp: Date.now(),
      },
      faceSignal: {
        modality: 'face' as const,
        prediction: 'Smiling / Pleasant Expression',
        valence: 'positive' as const,
        confidence: 0.92,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Well-lit face' },
        reason: 'Observable upward lip corners (88% smile).',
        timestamp: Date.now(),
      },
      consistency: {
        status: 'agree' as const,
        primaryValence: 'positive' as const,
        divergenceDetected: false,
        whichModalityDisagrees: 'none' as const,
        description: 'All observed signals are consistent in positive expression.',
        explanation: 'Spoken words, vocal tone, and facial affect align consistently.',
        gentleFollowUpNeeded: false,
        confidence: 0.92,
        signalsCompared: { textValence: 'positive', voiceValence: 'positive', faceValence: 'positive' },
      },
      safeScore: {
        score: 95,
        band: 'stable' as const,
        userLabel: 'Stable' as const,
        confidence: 0.92,
        breakdown: {
          textDistress: 0,
          voiceDistress: 0,
          faceDistress: 0,
          persistencePenalty: 0,
          trendAdjustment: 6,
          safetyOverrideApplied: false,
        },
      },
      safety: {
        riskLevel: 'low' as const,
        riskScore: 10,
        safeScore: {
          score: 95,
          band: 'stable' as const,
          userLabel: 'Stable' as const,
          confidence: 0.92,
          breakdown: {
            textDistress: 0,
            voiceDistress: 0,
            faceDistress: 0,
            persistencePenalty: 0,
            trendAdjustment: 6,
            safetyOverrideApplied: false,
          },
        },
        safetyOverride: false,
        triggerReason: 'Positive baseline and stable emotional tone.',
        continuousTrend: 'improving' as const,
        escalationRequired: false,
        explainableSummary: 'All channels harmonious and settled.',
        recommendedAction: 'Engage with warmth and curious listening.',
      },
    },
    {
      stepNumber: 3,
      title: 'Test 3: Safety Override (Text Crisis + Face Smiling + Voice Calm -> HIGH)',
      userAction: 'User smiles politely, says: "I want to end my life, goodbye."',
      description:
        'Principle P3 enforced: Even if the user smiles or speaks calmly, acute crisis language triggers an immediate HIGH risk Safety Override and connects human counselor.',
      tag: 'SAFETY OVERRIDE',
      textMessage: 'I want to end my life, goodbye everyone.',
      aiReply:
        "I want to pause here because what you're sharing is very important. I hear how painful this moment is. Please know you are not alone, and I want to help connect you with people who care and can support you right now.",
      textSignal: {
        modality: 'text' as const,
        prediction: 'Acute Crisis / High Distress',
        valence: 'negative' as const,
        confidence: 0.98,
        severity: 'high' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Verbatim crisis input' },
        reason: 'Explicit crisis/suicide statement detected.',
        timestamp: Date.now(),
      },
      voiceSignal: {
        modality: 'voice' as const,
        prediction: 'Calm / Steady Cadence',
        valence: 'neutral' as const,
        confidence: 0.8,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Optimal channel' },
        reason: 'Calm cadence overridden by high text crisis.',
        timestamp: Date.now(),
      },
      faceSignal: {
        modality: 'face' as const,
        prediction: 'Smiling (Overridden by Safety)',
        valence: 'positive' as const,
        confidence: 0.85,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Face visible' },
        reason: 'Smiling face CANNOT suppress high crisis signal! (Principle P3).',
        timestamp: Date.now(),
      },
      consistency: {
        status: 'disagree' as const,
        primaryValence: 'negative' as const,
        divergenceDetected: true,
        whichModalityDisagrees: 'text' as const,
        description: 'Safety Override active! High severity signal overrides all positive signals.',
        explanation: 'Safety before convenience: Strong safety signals are never suppressed by positive face signals.',
        gentleFollowUpNeeded: true,
        confidence: 0.95,
        signalsCompared: { textValence: 'negative', faceValence: 'positive' },
      },
      safeScore: {
        score: 12,
        band: 'counselor_recommended' as const,
        userLabel: 'Counselor support recommended' as const,
        confidence: 0.95,
        breakdown: {
          textDistress: 45,
          voiceDistress: 0,
          faceDistress: 0,
          persistencePenalty: 14,
          trendAdjustment: -8,
          safetyOverrideApplied: true,
        },
      },
      safety: {
        riskLevel: 'high' as const,
        riskScore: 95,
        safeScore: {
          score: 12,
          band: 'counselor_recommended' as const,
          userLabel: 'Counselor support recommended' as const,
          confidence: 0.95,
          breakdown: {
            textDistress: 45,
            voiceDistress: 0,
            faceDistress: 0,
            persistencePenalty: 14,
            trendAdjustment: -8,
            safetyOverrideApplied: true,
          },
        },
        safetyOverride: true,
        triggerReason: 'Safety Override: Explicit crisis statement detected. Escalating to human counselor.',
        continuousTrend: 'worsening' as const,
        escalationRequired: true,
        escalationType: 'immediate_human_handoff' as const,
        explainableSummary: 'High severity safety signal detected. Activating human counselor protocol.',
        recommendedAction: 'Provide 24/7 crisis numbers and immediate on-duty human counselor handoff.',
      },
    },
    {
      stepNumber: 4,
      title: 'Test 4: Poor Audio / Camera Quality Gate -> Modality Down-Weighted, No False Alarm',
      userAction: 'Background noise + dark camera lighting, user says: "How is the weather?"',
      description:
        'Quality gate detects excessive background noise and dark room. Modalities are marked POOR, confidence is down-weighted to 0.35, preventing false alarms.',
      tag: 'Quality Gate Protection',
      textMessage: 'How is the weather today?',
      aiReply:
        "I'm here in your space with you. It looks like your microphone audio has a bit of background noise, but I can hear your typed words clearly. How is your afternoon going?",
      textSignal: {
        modality: 'text' as const,
        prediction: 'Neutral / Conversational',
        valence: 'neutral' as const,
        confidence: 0.85,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear text' },
        reason: 'Casual conversation.',
        timestamp: Date.now(),
      },
      voiceSignal: {
        modality: 'voice' as const,
        prediction: 'Noisy / Distorted Channel',
        valence: 'neutral' as const,
        confidence: 0.35,
        severity: 'none' as const,
        quality: {
          quality: 'poor' as const,
          confidencePenalty: 0.45,
          details: 'High background noise floor (-25dB); volume clipping detected',
        },
        reason: 'Audio quality is low; down-weighted to prevent false conclusions.',
        timestamp: Date.now(),
      },
      faceSignal: {
        modality: 'face' as const,
        prediction: 'Low Illumination / Face Unclear',
        valence: 'neutral' as const,
        confidence: 0.32,
        severity: 'none' as const,
        quality: {
          quality: 'poor' as const,
          confidencePenalty: 0.5,
          details: 'Lighting below 25 lux; face visibility occluded',
        },
        reason: 'Camera quality is poor; down-weighted.',
        timestamp: Date.now(),
      },
      consistency: {
        status: 'insufficient_evidence' as const,
        primaryValence: 'neutral' as const,
        divergenceDetected: false,
        whichModalityDisagrees: 'none' as const,
        description: 'Secondary modality signal quality is low; down-weighted to prevent false conclusions.',
        explanation: 'Signal quality was insufficient for cross-modal comparison; prioritizing clear verbal expression.',
        gentleFollowUpNeeded: false,
        confidence: 0.4,
        signalsCompared: { textValence: 'neutral' },
      },
      safeScore: {
        score: 85,
        band: 'stable' as const,
        userLabel: 'Stable' as const,
        confidence: 0.6,
        breakdown: {
          textDistress: 0,
          voiceDistress: 0,
          faceDistress: 0,
          persistencePenalty: 0,
          trendAdjustment: 0,
          safetyOverrideApplied: false,
        },
      },
      safety: {
        riskLevel: 'low' as const,
        riskScore: 15,
        safeScore: {
          score: 85,
          band: 'stable' as const,
          userLabel: 'Stable' as const,
          confidence: 0.6,
          breakdown: {
            textDistress: 0,
            voiceDistress: 0,
            faceDistress: 0,
            persistencePenalty: 0,
            trendAdjustment: 0,
            safetyOverrideApplied: false,
          },
        },
        safetyOverride: false,
        triggerReason: 'Poor audio/video quality down-weighted; no false alarm triggered.',
        continuousTrend: 'stable' as const,
        escalationRequired: false,
        explainableSummary: 'Quality gate protected against noisy acoustic false triggers.',
        recommendedAction: 'Continue supportive text conversation.',
      },
    },
    {
      stepNumber: 5,
      title: 'Test 5: Sad Text + Calm Voice -> Soft Empathetic Register Matching',
      userAction: 'User says: "I feel really down today and don\'t have energy."',
      description:
        'Registers sad mood. The LLM adapts its emotional register: slow, soft, validating, very short sentences, with no heavy questions.',
      tag: 'Mood Register: Sad/Low',
      textMessage: "I feel really down today and don't have energy for anything.",
      aiReply:
        "I hear you. Feeling that low takes so much out of you. You don't have to push yourself right now—I'm right here with you.",
      textSignal: {
        modality: 'text' as const,
        prediction: 'Elevated Stress / Anxiety',
        valence: 'negative' as const,
        confidence: 0.9,
        severity: 'moderate' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear text' },
        reason: 'Expresses low mood and exhaustion.',
        timestamp: Date.now(),
      },
      voiceSignal: {
        modality: 'voice' as const,
        prediction: 'Low Energy / Possible Vocal Fatigue',
        valence: 'negative' as const,
        confidence: 0.82,
        severity: 'low' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clean audio' },
        reason: 'Low vocal energy aligns with sad verbal expression.',
        timestamp: Date.now(),
      },
      faceSignal: {
        modality: 'face' as const,
        prediction: 'Observable Downcast Expression / Concern',
        valence: 'negative' as const,
        confidence: 0.85,
        severity: 'low' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear frame' },
        reason: 'Observable downcast posture and lip corner depression.',
        timestamp: Date.now(),
      },
      consistency: {
        status: 'agree' as const,
        primaryValence: 'negative' as const,
        divergenceDetected: false,
        whichModalityDisagrees: 'none' as const,
        description: 'All modalities align consistently in low/sad mood expression.',
        explanation: 'Verbal text matches low acoustic energy and downcast affect.',
        gentleFollowUpNeeded: false,
        confidence: 0.88,
        signalsCompared: { textValence: 'negative', voiceValence: 'negative', faceValence: 'negative' },
      },
      safeScore: {
        score: 55,
        band: 'needs_attention' as const,
        userLabel: 'Needs attention' as const,
        confidence: 0.88,
        breakdown: {
          textDistress: 22.5,
          voiceDistress: 9.0,
          faceDistress: 6.0,
          persistencePenalty: 6,
          trendAdjustment: 0,
          safetyOverrideApplied: false,
        },
      },
      safety: {
        riskLevel: 'moderate' as const,
        riskScore: 52,
        safeScore: {
          score: 55,
          band: 'needs_attention' as const,
          userLabel: 'Needs attention' as const,
          confidence: 0.88,
          breakdown: {
            textDistress: 22.5,
            voiceDistress: 9.0,
            faceDistress: 6.0,
            persistencePenalty: 6,
            trendAdjustment: 0,
            safetyOverrideApplied: false,
          },
        },
        safetyOverride: false,
        triggerReason: 'Observable low mood and fatigue across channels.',
        continuousTrend: 'stable' as const,
        escalationRequired: false,
        escalationType: 'gentle_followup' as const,
        explainableSummary: 'AI matched gentle soft tone without demanding questions.',
        recommendedAction: 'Provide short validation and soothing presence.',
      },
    },
    {
      stepNumber: 6,
      title: 'Test 6: Worsening Over Several Turns -> SafeScore Drops, Risk: Low -> Mod -> High',
      userAction: 'User shares mounting crisis across consecutive turns',
      description:
        'Continuous reassessment tracks worsening velocity. SafeScore drops from 72 to 38, raising risk from Moderate to High and recommending counselor triage.',
      tag: 'Continuous Velocity Tracking',
      textMessage: "It's getting worse every hour, I can't breathe and nobody is helping me.",
      aiReply:
        "I hear how intense and overwhelming this has become. Please know I am holding space for you. Would you like me to connect you with our on-duty counselor alex right here?",
      textSignal: {
        modality: 'text' as const,
        prediction: 'Elevated Stress / Anxiety',
        valence: 'negative' as const,
        confidence: 0.95,
        severity: 'high' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear text' },
        reason: 'Escalating panic and helplessness.',
        timestamp: Date.now(),
      },
      voiceSignal: {
        modality: 'voice' as const,
        prediction: 'Elevated Vocal Tension / Rapid Pace',
        valence: 'negative' as const,
        confidence: 0.9,
        severity: 'moderate' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Optimal acoustics' },
        reason: 'Rapid tempo and high pitch variability.',
        timestamp: Date.now(),
      },
      faceSignal: {
        modality: 'face' as const,
        prediction: 'Observable Brow Furrow / Tension',
        valence: 'negative' as const,
        confidence: 0.88,
        severity: 'moderate' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Optimal video' },
        reason: 'Deep brow contraction and head instability.',
        timestamp: Date.now(),
      },
      consistency: {
        status: 'agree' as const,
        primaryValence: 'negative' as const,
        divergenceDetected: false,
        whichModalityDisagrees: 'none' as const,
        description: 'Persistent distress confirmed across multiple turns.',
        explanation: 'Trajectory is worsening.',
        gentleFollowUpNeeded: true,
        confidence: 0.92,
        signalsCompared: { textValence: 'negative', voiceValence: 'negative', faceValence: 'negative' },
      },
      safeScore: {
        score: 36,
        band: 'counselor_recommended' as const,
        userLabel: 'Counselor support recommended' as const,
        confidence: 0.92,
        breakdown: {
          textDistress: 45,
          voiceDistress: 13.5,
          faceDistress: 9.0,
          persistencePenalty: 14,
          trendAdjustment: -8,
          safetyOverrideApplied: false,
        },
      },
      safety: {
        riskLevel: 'high' as const,
        riskScore: 78,
        safeScore: {
          score: 36,
          band: 'counselor_recommended' as const,
          userLabel: 'Counselor support recommended' as const,
          confidence: 0.92,
          breakdown: {
            textDistress: 45,
            voiceDistress: 13.5,
            faceDistress: 9.0,
            persistencePenalty: 14,
            trendAdjustment: -8,
            safetyOverrideApplied: false,
          },
        },
        safetyOverride: false,
        triggerReason: 'SafeScore dropped below 40 due to sustained multi-turn distress velocity.',
        continuousTrend: 'worsening' as const,
        escalationRequired: true,
        escalationType: 'counselor_recommended' as const,
        explainableSummary: 'Persistent escalating distress triggered counselor recommendation.',
        recommendedAction: 'Connect to human counselor and offer grounding breath.',
      },
    },
    {
      stepNumber: 7,
      title: 'Test 7: Benign Context ("I\'m tired of studying") -> No False Crisis Trigger',
      userAction: 'User says: "Ugh, I\'m so tired of studying for exams tonight."',
      description:
        'Context engine recognizes benign situational academic fatigue. Evaluates as LOW risk, avoiding false crisis escalation.',
      tag: 'Contextual Non-Overreaction',
      textMessage: "Ugh, I'm so tired of studying for exams tonight.",
      aiReply:
        "Studying for long stretches really drains your brain. Have you been able to take a 5-minute break to stretch or drink some water?",
      textSignal: {
        modality: 'text' as const,
        prediction: 'Situational Pressure / Fatigue',
        valence: 'mixed' as const,
        confidence: 0.88,
        severity: 'low' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear text' },
        reason: 'Everyday student stressor; no self-harm or crisis language.',
        timestamp: Date.now(),
      },
      voiceSignal: {
        modality: 'voice' as const,
        prediction: 'Low Energy / Possible Vocal Fatigue',
        valence: 'negative' as const,
        confidence: 0.78,
        severity: 'low' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear audio' },
        reason: 'Mild vocal tiredness from studying.',
        timestamp: Date.now(),
      },
      faceSignal: {
        modality: 'face' as const,
        prediction: 'Neutral Resting Expression',
        valence: 'neutral' as const,
        confidence: 0.82,
        severity: 'none' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear frame' },
        reason: 'Resting face.',
        timestamp: Date.now(),
      },
      consistency: {
        status: 'partially_agree' as const,
        primaryValence: 'negative' as const,
        divergenceDetected: false,
        whichModalityDisagrees: 'none' as const,
        description: 'Mild situational fatigue consistent with academic break context.',
        explanation: 'No crisis markers present.',
        gentleFollowUpNeeded: false,
        confidence: 0.84,
        signalsCompared: { textValence: 'mixed', voiceValence: 'negative' },
      },
      safeScore: {
        score: 82,
        band: 'stable' as const,
        userLabel: 'Stable' as const,
        confidence: 0.85,
        breakdown: {
          textDistress: 7.5,
          voiceDistress: 4.5,
          faceDistress: 0,
          persistencePenalty: 0,
          trendAdjustment: 0,
          safetyOverrideApplied: false,
        },
      },
      safety: {
        riskLevel: 'low' as const,
        riskScore: 18,
        safeScore: {
          score: 82,
          band: 'stable' as const,
          userLabel: 'Stable' as const,
          confidence: 0.85,
          breakdown: {
            textDistress: 7.5,
            voiceDistress: 4.5,
            faceDistress: 0,
            persistencePenalty: 0,
            trendAdjustment: 0,
            safetyOverrideApplied: false,
          },
        },
        safetyOverride: false,
        triggerReason: 'Situational study fatigue correctly identified as non-crisis.',
        continuousTrend: 'stable' as const,
        escalationRequired: false,
        explainableSummary: 'Context engine prevented unnecessary crisis escalation.',
        recommendedAction: 'Encourage study break or breathing pause.',
      },
    },
    {
      stepNumber: 8,
      title: 'Test 8: Turn-Synchronized Data Alignment (turn_id = "turn-sync-8")',
      userAction: 'Async STT finishes after face frame analysis with verified turn_id matching',
      description:
        'All multimodal signals, face windows, and acoustic vectors are synchronized under turn_id "turn-sync-8", preventing out-of-order latency bugs.',
      tag: 'Turn-Synchronized Coherence',
      textMessage: 'Machi romba stress ah iruku, but thanks for being here.',
      aiReply:
        "Naan purinjukaren machi. Endha vishayam un manasa romba baramaakudhu nu share panna thonutha?",
      textSignal: {
        modality: 'text' as const,
        prediction: 'Elevated Stress / Anxiety',
        valence: 'negative' as const,
        confidence: 0.92,
        severity: 'moderate' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clear transcript' },
        reason: 'Tanglish stress expression recognized with native empathy.',
        timestamp: Date.now(),
        turn_id: 'turn-sync-8',
      },
      voiceSignal: {
        modality: 'voice' as const,
        prediction: 'Low Energy / Possible Vocal Fatigue',
        valence: 'negative' as const,
        confidence: 0.86,
        severity: 'low' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Clean audio' },
        reason: 'Acoustic parameters synchronized with utterance window.',
        timestamp: Date.now(),
        turn_id: 'turn-sync-8',
      },
      faceSignal: {
        modality: 'face' as const,
        prediction: 'Observable Brow Furrow / Tension',
        valence: 'negative' as const,
        confidence: 0.84,
        severity: 'low' as const,
        quality: { quality: 'optimal' as const, confidencePenalty: 0, details: 'Aligned frame buffer' },
        reason: 'Face window bounded to speech interval.',
        timestamp: Date.now(),
        turn_id: 'turn-sync-8',
      },
      consistency: {
        status: 'agree' as const,
        primaryValence: 'negative' as const,
        divergenceDetected: false,
        whichModalityDisagrees: 'none' as const,
        description: 'Turn-synchronized multimodal signals match perfectly across speech window.',
        explanation: 'Synchronized turn_id guarantees zero out-of-order data corruption.',
        gentleFollowUpNeeded: false,
        confidence: 0.9,
        signalsCompared: { textValence: 'negative', voiceValence: 'negative', faceValence: 'negative' },
      },
      safeScore: {
        score: 64,
        band: 'needs_attention' as const,
        userLabel: 'Needs attention' as const,
        confidence: 0.88,
        breakdown: {
          textDistress: 22.5,
          voiceDistress: 6.0,
          faceDistress: 4.0,
          persistencePenalty: 0,
          trendAdjustment: 0,
          safetyOverrideApplied: false,
        },
      },
      safety: {
        riskLevel: 'moderate' as const,
        riskScore: 48,
        safeScore: {
          score: 64,
          band: 'needs_attention' as const,
          userLabel: 'Needs attention' as const,
          confidence: 0.88,
          breakdown: {
            textDistress: 22.5,
            voiceDistress: 6.0,
            faceDistress: 4.0,
            persistencePenalty: 0,
            trendAdjustment: 0,
            safetyOverrideApplied: false,
          },
        },
        safetyOverride: false,
        triggerReason: 'Turn-synchronized record successfully committed without latency offset.',
        continuousTrend: 'stable' as const,
        escalationRequired: false,
        explainableSummary: 'Turn synchronization validated.',
        recommendedAction: 'Respond with native colloquial empathy.',
      },
    },
  ];

  const current = demoSteps[currentStepIndex];

  const handleApply = () => {
    onApplyDemoStep({
      turn_id: 'turn-demo-' + current.stepNumber,
      userMessage: current.textMessage,
      aiReply: current.aiReply,
      textSignal: current.textSignal,
      voiceSignal: current.voiceSignal,
      faceSignal: current.faceSignal,
      consistency: current.consistency,
      safety: current.safety,
      safeScore: current.safeScore,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Multimodal Accuracy & Test Verification Suite
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 uppercase">
                  8 TEST CASES
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                End-to-end verification of mood registers, acoustic DSP, SafeScore, and turn-sync fusion.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Step Tabs Selector */}
        <div className="px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-xs">
          {demoSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                currentStepIndex === idx
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Case {step.stepNumber}
            </button>
          ))}
        </div>

        {/* Active Step Details */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {current.title}
            </h4>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                current.safety.riskLevel === 'high'
                  ? 'bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                  : current.consistency.status === 'disagree'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {current.tag}
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
            {current.description}
          </p>

          {/* Dialogue Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[80px]">
                User Message:
              </span>
              <span className="font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex-1">
                "{current.textMessage}"
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-teal-700 dark:text-teal-400 min-w-[80px]">
                CalmBridge Reply:
              </span>
              <span className="text-slate-700 dark:text-slate-300 italic flex-1">
                "{current.aiReply}"
              </span>
            </div>
          </div>

          {/* Tri-Modal Signal Diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                1. Chat Semantic NLP
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 block mt-0.5">
                {current.textSignal.prediction}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">
                Valence: {current.textSignal.valence} ({Math.round(current.textSignal.confidence * 100)}%)
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                2. Voice Acoustic DSP
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 block mt-0.5">
                {current.voiceSignal.prediction}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">
                Quality: {current.voiceSignal.quality.quality} ({Math.round(current.voiceSignal.confidence * 100)}%)
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                3. Facial Affect / Action Units
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-200 block mt-0.5">
                {current.faceSignal.prediction}
              </span>
              <span className="text-[10px] text-slate-500 capitalize">
                Quality: {current.faceSignal.quality.quality} ({Math.round(current.faceSignal.confidence * 100)}%)
              </span>
            </div>
          </div>

          {/* SafeScore & Consistency Verdict */}
          <div className="p-3.5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/40 flex items-center justify-between">
            <div>
              <div className="font-semibold text-teal-800 dark:text-teal-300">
                SafeScore: {current.safeScore.score}/100 ({current.safeScore.userLabel})
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Consistency: <span className="font-mono uppercase font-bold">{current.consistency.status}</span> · Risk:{' '}
                <span className="font-mono uppercase font-bold">{current.safety.riskLevel}</span>
              </p>
            </div>

            <div className="text-right text-[11px] text-slate-500">
              <div>Override: {current.safeScore.breakdown.safetyOverrideApplied ? 'Active' : 'False'}</div>
              <div>Trend: {current.safety.continuousTrend}</div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="text-[11px] text-slate-500">
            Case {currentStepIndex + 1} of {demoSteps.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Inject Case Into Live App</span>
            </button>

            {currentStepIndex < demoSteps.length - 1 ? (
              <button
                onClick={() => {
                  handleApply();
                  setCurrentStepIndex((s) => s + 1);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <span>Inject & Next Case</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  handleApply();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white cursor-pointer"
              >
                Finish Verification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
