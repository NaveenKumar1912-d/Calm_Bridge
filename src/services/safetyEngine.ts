/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ModalitySignal,
  ConsistencyAnalysis,
  ConsistencyStatus,
  SafetyAssessment,
  RiskLevel,
  TrendDirection,
  QualityMetrics,
  AcousticFeatures,
  FacialAffectAnalysis,
  PersonalBaseline,
  SafeScoreResult,
  TurnRecord,
} from '../types';

// High-risk safety keywords that trigger mandatory Safety Override
const ACUTE_CRISIS_PATTERNS = [
  /\b(kill myself|suicide|end my life|end it all|die|hang myself|slit|overdose|want to not wake up)\b/i,
  /\b(hurt myself|self[- ]harm|cut myself|bleeding|punish myself)\b/i,
  /\b(no reason to live|better off without me|no point living|goodbye everyone|final goodbye)\b/i,
];

// Moderate distress patterns (stress, persistent anxiety, feeling overwhelmed)
const MODERATE_DISTRESS_PATTERNS = [
  /\b(overwhelmed|panic attack|can't breathe|shaking|so anxious|constant panic)\b/i,
  /\b(depressed|hopeless|crying constantly|feel numb|empty inside|drowning in work)\b/i,
  /\b(nobody cares|completely alone|isolated|can't cope|breaking down)\b/i,
  /\b(romba stress|romba bayama iruku|thanga mudiyala|manasu valikudhu|thani iruka)\b/i, // Tamil/Tanglish distress phrases
];

// Contextual benign stress (e.g. exams, tired of studying - MUST NOT trigger crisis)
const BENIGN_STRESS_PATTERNS = [
  /\b(tired of studying|exam tomorrow|lots of homework|busy week|bad day at work|sleepy)\b/i,
  /\b(machi romba work iruku|exhausted from college|need a break)\b/i,
];

// Specific emotional patterns
const LONELINESS_PATTERNS = [
  /\b(lonely|alone|nobody to talk to|isolated|no friends|feel invisible|nobody understands|empty)\b/i,
  /\b(thaniya iruka|yaarum illa)\b/i,
];

const SADNESS_GRIEF_PATTERNS = [
  /\b(sad|crying|tears|grief|heartbroken|hurting|grieving|lost someone|breakup|hurts so bad|sorrow)\b/i,
  /\b(azhugaiya varudhu|romba valikudhu)\b/i,
];

const FRUSTRATION_ANGER_PATTERNS = [
  /\b(angry|mad|frustrated|annoyed|unfair|irritated|furious|sick of this|pissed)\b/i,
  /\b(kovama iruku|erichala iruku)\b/i,
];

const EXHAUSTION_PATTERNS = [
  /\b(tired|exhausted|drained|burnout|can't sleep|insomnia|no energy|fatigue|sleepy)\b/i,
  /\b(romba tired|thoonga mudiyala|udal vali)\b/i,
];

// Positive sentiment patterns
const POSITIVE_PATTERNS = [
  /\b(fine|good|great|happy|okay|peaceful|better|relieved|doing well|calm|excited|grateful|blessed|smiling)\b/i,
  /\b(nalla iruku|super|santhosham|semma)\b/i,
];

/**
 * Text Modality Analyzer
 * Analyzes sentiment, emotion, intensity, stress, and crisis safety language.
 */
export function analyzeTextSignal(
  text: string,
  quality: QualityMetrics = { quality: 'optimal', confidencePenalty: 0, details: 'Clear text input' }
): ModalitySignal {
  const clean = text.trim();
  const timestamp = Date.now();

  if (!clean) {
    return {
      modality: 'text',
      prediction: 'Neutral',
      valence: 'neutral',
      confidence: 0.5,
      severity: 'none',
      quality,
      reason: 'Empty input provided',
      timestamp,
    };
  }

  // 1. Check acute crisis first (Safety Override trigger)
  for (const pattern of ACUTE_CRISIS_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        modality: 'text',
        prediction: 'Acute Crisis / High Distress',
        valence: 'negative',
        confidence: Math.max(0.95 - quality.confidencePenalty, 0.7),
        severity: 'high',
        quality,
        reason: 'Language indicates possible immediate crisis or self-harm thoughts',
        timestamp,
      };
    }
  }

  // 2. Check benign stress context (Must not overreact)
  const isBenign = BENIGN_STRESS_PATTERNS.some((p) => p.test(clean));
  if (isBenign) {
    return {
      modality: 'text',
      prediction: 'Situational Pressure / Everyday Stress',
      valence: 'mixed',
      confidence: Math.max(0.85 - quality.confidencePenalty, 0.6),
      severity: 'low',
      quality,
      reason: 'Everyday stressor (e.g. study/workload); no crisis language detected',
      timestamp,
    };
  }

  // 3. Check moderate distress & panic
  for (const pattern of MODERATE_DISTRESS_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        modality: 'text',
        prediction: 'Elevated Stress / Anxiety',
        valence: 'negative',
        confidence: Math.max(0.88 - quality.confidencePenalty, 0.6),
        severity: 'moderate',
        quality,
        reason: 'Observable markers of significant stress, exhaustion, or emotional weight',
        timestamp,
      };
    }
  }

  // 4. Check Loneliness & Isolation
  if (LONELINESS_PATTERNS.some((p) => p.test(clean))) {
    return {
      modality: 'text',
      prediction: 'Loneliness / Seeking Connection',
      valence: 'negative',
      confidence: Math.max(0.86 - quality.confidencePenalty, 0.6),
      severity: 'low',
      quality,
      reason: 'User expresses feelings of isolation, loneliness, or craving supportive presence',
      timestamp,
    };
  }

  // 5. Check Sadness & Emotional Pain
  if (SADNESS_GRIEF_PATTERNS.some((p) => p.test(clean))) {
    return {
      modality: 'text',
      prediction: 'Sadness / Emotional Hurt',
      valence: 'negative',
      confidence: Math.max(0.87 - quality.confidencePenalty, 0.6),
      severity: 'moderate',
      quality,
      reason: 'Expression of sadness, grief, heartbreak, or emotional tears',
      timestamp,
    };
  }

  // 6. Check Frustration & Anger
  if (FRUSTRATION_ANGER_PATTERNS.some((p) => p.test(clean))) {
    return {
      modality: 'text',
      prediction: 'Frustration / Agitation',
      valence: 'negative',
      confidence: Math.max(0.85 - quality.confidencePenalty, 0.6),
      severity: 'low',
      quality,
      reason: 'Observable expressions of annoyance, irritation, or feeling treated unfairly',
      timestamp,
    };
  }

  // 7. Check Physical & Mental Exhaustion
  if (EXHAUSTION_PATTERNS.some((p) => p.test(clean))) {
    return {
      modality: 'text',
      prediction: 'Fatigue / Mental Depletion',
      valence: 'negative',
      confidence: Math.max(0.85 - quality.confidencePenalty, 0.6),
      severity: 'low',
      quality,
      reason: 'Mentions of heavy tiredness, insomnia, drained energy, or burnout',
      timestamp,
    };
  }

  // 8. Positive markers
  const isPositive = POSITIVE_PATTERNS.some((p) => p.test(clean));
  if (isPositive) {
    return {
      modality: 'text',
      prediction: 'Positive / Reassuring Words',
      valence: 'positive',
      confidence: Math.max(0.88 - quality.confidencePenalty, 0.5),
      severity: 'none',
      quality,
      reason: 'Explicitly reassuring words, relief, gratitude, or pleasant expressions',
      timestamp,
    };
  }

  // Default neutral/open
  return {
    modality: 'text',
    prediction: 'Neutral / Conversational',
    valence: 'neutral',
    confidence: Math.max(0.78 - quality.confidencePenalty, 0.5),
    severity: 'none',
    quality,
    reason: 'Balanced conversational expression without marked distress cues',
    timestamp,
  };
}

/**
 * Interpret Vocal Acoustic Metrics
 * Pitch (F0), variability, energy, tempo, pauses, silence ratio, jitter, spectral centroid.
 * Never claims internal emotion detection; indicates observable acoustic patterns.
 */
export function interpretVoiceAcoustics(
  metrics: AcousticFeatures,
  quality: QualityMetrics,
  baseline?: PersonalBaseline | null
): ModalitySignal {
  const timestamp = Date.now();
  let severity: 'none' | 'low' | 'moderate' | 'high' = 'none';
  let prediction = 'Calm / Steady Cadence';
  let valence: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
  let reason = 'Acoustic parameters indicate steady pace and balanced vocal energy';

  // 1. Flat monotone + low energy + long pauses = possible fatigue or withdrawal
  if (
    (metrics.vocalArousal === 'flat_monotone' ||
      (metrics.pitchVariability < 14 && metrics.energyRMS < 0.035 && metrics.silenceRatio > 0.35))
  ) {
    prediction = 'Low Energy / Possible Vocal Fatigue';
    valence = 'negative';
    severity = 'low';
    reason = `Reduced pitch modulation (var: ${metrics.pitchVariability}Hz), low vocal energy, and higher silence ratio (${Math.round(
      metrics.silenceRatio * 100
    )}%) observed`;
  }
  // 2. High pitch variance + rapid tempo + high spectral centroid = elevated agitation/tension
  else if (
    metrics.vocalArousal === 'agitated' ||
    (metrics.pitchVariability > 48 && metrics.speakingRate > 3.8 && metrics.energyRMS > 0.09)
  ) {
    prediction = 'Elevated Vocal Tension / Rapid Pace';
    valence = 'negative';
    severity = 'moderate';
    reason = `Rapid speaking tempo (${metrics.speakingRate} syl/s), elevated pitch variability (${metrics.pitchVariability}Hz), and vocal tension observed`;
  }
  // 3. Warm, expressive voice
  else if (metrics.pitchVariability >= 20 && metrics.pitchVariability <= 45 && metrics.energyRMS >= 0.04) {
    prediction = 'Expressive / Warm Voice';
    valence = 'positive';
    severity = 'none';
    reason = 'Natural conversational pitch modulation and relaxed vocal cadence';
  }

  // Baseline deviation check
  if (baseline && baseline.isCalibrated) {
    const energyDrop = ((baseline.energyRMS - metrics.energyRMS) / (baseline.energyRMS || 0.05)) * 100;
    const pauseIncrease = ((metrics.silenceRatio - baseline.pauseRatio) / (baseline.pauseRatio || 0.2)) * 100;

    if (energyDrop > 35 && pauseIncrease > 40) {
      prediction = 'Noticeable Energy Drop from Personal Baseline';
      valence = 'negative';
      severity = severity === 'none' ? 'low' : severity;
      reason += ' (Vocal energy is 35%+ below your personal calibrated baseline)';
    }
  }

  // Quality gate down-weighting
  let confidence = 0.85 - quality.confidencePenalty;
  if (quality.quality === 'poor') {
    confidence = Math.min(confidence, 0.42);
    reason += ' (Input quality is low; down-weighted)';
  }

  return {
    modality: 'voice',
    prediction,
    valence,
    confidence: Math.max(0.3, Math.min(0.95, confidence)),
    severity,
    quality,
    reason,
    timestamp,
    acousticMetrics: metrics,
  };
}

/**
 * Interpret Facial Affect Signals
 * Observable cues: action units, dominant expression, temporal change, stability.
 */
export function interpretFacialAffect(
  analysis: FacialAffectAnalysis,
  quality: QualityMetrics,
  baseline?: PersonalBaseline | null
): ModalitySignal {
  const timestamp = Date.now();
  let severity: 'none' | 'low' | 'moderate' | 'high' = 'none';
  let prediction = 'Neutral Resting Expression';
  let valence: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
  let reason = 'Relaxed facial musculature observed';

  const happy = analysis.expressions.happy;
  const sad = analysis.expressions.sad;
  const angry = analysis.expressions.angry;
  const browTension = analysis.actionUnits.browLowering;

  if (happy > 0.55 || analysis.actionUnits.lipCornerPull > 0.5) {
    prediction = 'Smiling / Pleasant Expression';
    valence = 'positive';
    severity = 'none';
    reason = `Observable upward lip corner movement and pleasant affect (smile prob: ${Math.round(
      happy * 100
    )}%)`;
  } else if (analysis.temporalChange.suddenDropInPositiveAffect) {
    prediction = 'Sudden Drop in Positive Affect';
    valence = 'negative';
    severity = 'low';
    reason = 'Observable quick shift from smiling to furrowed or downcast posture';
  } else if (sad > 0.45 || analysis.actionUnits.lipCornerDrop > 0.45) {
    prediction = 'Observable Downcast Expression / Concern';
    valence = 'negative';
    severity = 'low';
    reason = 'Observable lip corner depression and downcast affect';
  } else if (browTension > 0.55 || angry > 0.45) {
    prediction = 'Observable Brow Furrow / Tension';
    valence = 'negative';
    severity = 'low';
    reason = `Observable brow furrowing and facial concentration/tension (tension: ${Math.round(
      browTension * 100
    )}%)`;
  } else if (analysis.temporalChange.sustainedFlatAffect) {
    prediction = 'Sustained Flat / Low Mobility Affect';
    valence = 'neutral';
    severity = 'none';
    reason = 'Consistent resting facial expression across multiple consecutive frames';
  }

  // Quality gate down-weighting
  let confidence = analysis.confidence;
  if (quality.quality === 'poor' || !quality.faceDetected) {
    confidence = Math.min(confidence, 0.38);
    reason += ' (Camera visibility or lighting low; down-weighted)';
  }

  return {
    modality: 'face',
    prediction,
    valence,
    confidence: Math.max(0.25, Math.min(0.95, confidence)),
    severity,
    quality,
    reason,
    timestamp,
    facialMetrics: {
      smileLikelihood: analysis.expressions.happy,
      browTension: analysis.actionUnits.browLowering,
      expressiveness: analysis.expressiveness,
      faceStability: analysis.faceStability,
      dominantExpression: analysis.dominantExpression,
      expressions: analysis.expressions,
    },
  };
}

/**
 * Cross-Modal Emotional Consistency Analysis
 * Compares Text, Voice, and Face with the DISTRESS-PRIORITY (ASYMMETRIC) RULE.
 * 
 * Distress-Priority Rule:
 * If text and/or face look positive, but voice (or any modality) shows distress with
 * adequate confidence and quality, DO NOT average or let positive majority win!
 * Give the distress signal FIRST PRIORITY and mark "possible cross-modal emotional inconsistency".
 */
export function analyzeCrossModalConsistency(
  textSignal?: ModalitySignal,
  voiceSignal?: ModalitySignal,
  faceSignal?: ModalitySignal,
  turnHistory: TurnRecord[] = []
): ConsistencyAnalysis {
  const activeSignals = [textSignal, voiceSignal, faceSignal].filter(Boolean) as ModalitySignal[];

  if (activeSignals.length < 2) {
    return {
      status: 'insufficient_evidence',
      primaryValence: textSignal?.valence || 'neutral',
      divergenceDetected: false,
      description: 'Single modality active. Multimodal consistency comparison requires 2+ active signals.',
      explanation: 'Currently relying on text conversation. Voice and camera are optional.',
      gentleFollowUpNeeded: false,
      whichModalityDisagrees: 'none',
      confidence: 0.6,
      signalsCompared: {
        textValence: textSignal?.valence,
        voiceValence: voiceSignal?.valence,
        faceValence: faceSignal?.valence,
      },
    };
  }

  // Filter out modalities with poor quality or low confidence
  const reliableSignals = activeSignals.filter(
    (s) => s.quality.quality !== 'poor' && s.confidence >= 0.45
  );

  if (reliableSignals.length < 2) {
    return {
      status: 'insufficient_evidence',
      primaryValence: textSignal?.valence || 'neutral',
      divergenceDetected: false,
      description: 'Secondary modality signal quality is low; down-weighted to prevent false conclusions.',
      explanation: 'Signal quality was insufficient for cross-modal comparison; prioritizing clear verbal expression.',
      gentleFollowUpNeeded: false,
      whichModalityDisagrees: 'none',
      confidence: 0.55,
      signalsCompared: {
        textValence: textSignal?.valence,
        voiceValence: voiceSignal?.valence,
        faceValence: faceSignal?.valence,
      },
    };
  }

  // Check signals
  const textIsPositive = textSignal && textSignal.valence === 'positive';
  const voiceIsDistressed = voiceSignal && voiceSignal.valence === 'negative' && voiceSignal.confidence >= 0.5;
  const faceIsPositive = faceSignal && faceSignal.valence === 'positive';
  const faceIsDistressed = faceSignal && faceSignal.valence === 'negative' && faceSignal.confidence >= 0.5;

  // 1. Asymmetric Distress-Priority Rule:
  // Text says "I'm fine", face smiling, but voice shows acoustic distress/strain
  if (textIsPositive && voiceIsDistressed) {
    return {
      status: 'disagree',
      primaryValence: 'mixed',
      divergenceDetected: true,
      description: 'Possible cross-modal emotional divergence detected (verbal reassurance vs. vocal fatigue/strain).',
      explanation:
        'Your words express reassurance, while observable acoustic signals show lower energy or vocal strain. CalmBridge checks in gently without assuming how you truly feel.',
      gentleFollowUpNeeded: true,
      whichModalityDisagrees: 'voice',
      suggestedCheckInPrompt:
        "You mentioned you're okay. I could be wrong, but your voice sounds a little more tired than usual. If something is bothering you, you can talk to me about it. There's no rush, and I'm here to listen.",
      confidence: 0.86,
      signalsCompared: {
        textValence: textSignal?.valence,
        voiceValence: voiceSignal?.valence,
        faceValence: faceSignal?.valence,
      },
    };
  }

  // Text says "I'm fine", voice calm, but face shows sudden drop or heavy tension
  if (textIsPositive && faceIsDistressed && !voiceIsDistressed) {
    return {
      status: 'disagree',
      primaryValence: 'mixed',
      divergenceDetected: true,
      description: 'Possible cross-modal divergence (verbal reassurance vs. facial tension/concern).',
      explanation:
        'Your words express reassurance, while observable facial signals show brow tension or downcast affect. CalmBridge checks in gently without assumption.',
      gentleFollowUpNeeded: true,
      whichModalityDisagrees: 'face',
      suggestedCheckInPrompt:
        "You mentioned things are okay, but I noticed a little tension in your expression. I could easily be mistaken, but if there's anything on your mind, I'm right here.",
      confidence: 0.82,
      signalsCompared: {
        textValence: textSignal?.valence,
        voiceValence: voiceSignal?.valence,
        faceValence: faceSignal?.valence,
      },
    };
  }

  // All reliable modalities align
  const valences = reliableSignals.map((s) => s.valence);
  const allSame = valences.every((v) => v === valences[0]);

  if (allSame) {
    return {
      status: 'agree',
      primaryValence: valences[0] as 'positive' | 'neutral' | 'negative',
      divergenceDetected: false,
      description: 'All observed signals are consistent in expression.',
      explanation: 'Spoken/written words, vocal tone, and facial affect align consistently.',
      gentleFollowUpNeeded: false,
      whichModalityDisagrees: 'none',
      confidence: 0.9,
      signalsCompared: {
        textValence: textSignal?.valence,
        voiceValence: voiceSignal?.valence,
        faceValence: faceSignal?.valence,
      },
    };
  }

  // General disagreement between positive and negative
  const hasPositive = valences.includes('positive');
  const hasNegative = valences.includes('negative');

  if (hasPositive && hasNegative) {
    return {
      status: 'disagree',
      primaryValence: 'mixed',
      divergenceDetected: true,
      description: 'Observable signals show contrasting affective patterns.',
      explanation:
        'Different communication signals showed varying tones. CalmBridge remains open and supportive without jumping to conclusions.',
      gentleFollowUpNeeded: true,
      whichModalityDisagrees: voiceIsDistressed ? 'voice' : 'face',
      suggestedCheckInPrompt:
        "I want to make sure I'm really understanding how things are for you. How has your day truly felt?",
      confidence: 0.84,
      signalsCompared: {
        textValence: textSignal?.valence,
        voiceValence: voiceSignal?.valence,
        faceValence: faceSignal?.valence,
      },
    };
  }

  // Partially agree (e.g. neutral + positive, or neutral + negative)
  return {
    status: 'partially_agree',
    primaryValence: hasNegative ? 'negative' : 'positive',
    divergenceDetected: false,
    description: 'Signals partially align with subtle nuance in tone.',
    explanation: 'Subtle variations in expression noted; conversation flowing naturally.',
    gentleFollowUpNeeded: false,
    whichModalityDisagrees: 'none',
    confidence: 0.78,
    signalsCompared: {
      textValence: textSignal?.valence,
      voiceValence: voiceSignal?.valence,
      faceValence: faceSignal?.valence,
    },
  };
}

/**
 * SAFESCORE COMPUTATION ENGINE
 * 
 * Formula:
 * SafeScore = 100 - weighted_distress
 * distress = Σ (w_i × severity_i × confidence_i × quality_i) over text, voice, face
 * 
 * Bands:
 * 70-100: Stable
 * 40-69: Needs attention
 * below 40: Counselor support recommended
 * 
 * Overrides:
 * - Text acute self-harm language caps score < 25 immediately!
 * - Persistence boost: sustained distress over multiple turns lowers score.
 * - Trend adjustment: worsening lowers score, improving raises score.
 */
export function calculateSafeScore(
  textSignal?: ModalitySignal,
  voiceSignal?: ModalitySignal,
  faceSignal?: ModalitySignal,
  priorAssessments: SafetyAssessment[] = [],
  trend: TrendDirection = 'stable',
  safetyOverrideApplied = false
): SafeScoreResult {
  // Severity weight mapping: none=0, low=15, moderate=45, high=90
  const getSeverityVal = (sev: string) => {
    switch (sev) {
      case 'high':
        return 90;
      case 'moderate':
        return 45;
      case 'low':
        return 15;
      default:
        return 0;
    }
  };

  const getQualityMultiplier = (q?: QualityMetrics) => {
    if (!q) return 0.5;
    if (q.quality === 'optimal') return 1.0;
    if (q.quality === 'moderate') return 0.75;
    return 0.35; // Down-weight poor quality
  };

  // Modality weights: Text: 0.50, Voice: 0.30, Face: 0.20
  const wText = 0.5;
  const wVoice = 0.3;
  const wFace = 0.2;

  const textSev = getSeverityVal(textSignal?.severity || 'none');
  const textConf = textSignal?.confidence || 0.75;
  const textQual = getQualityMultiplier(textSignal?.quality);
  const textDistress = wText * textSev * textConf * textQual;

  const voiceSev = getSeverityVal(voiceSignal?.severity || 'none');
  const voiceConf = voiceSignal?.confidence || 0.7;
  const voiceQual = getQualityMultiplier(voiceSignal?.quality);
  const voiceDistress = wVoice * voiceSev * voiceConf * voiceQual;

  const faceSev = getSeverityVal(faceSignal?.severity || 'none');
  const faceConf = faceSignal?.confidence || 0.7;
  const faceQual = getQualityMultiplier(faceSignal?.quality);
  const faceDistress = wFace * faceSev * faceConf * faceQual;

  let totalDistress = textDistress + voiceDistress + faceDistress;

  // Persistence Penalty: If distress was present in previous turns
  let persistencePenalty = 0;
  const recentModerateOrHigh = priorAssessments
    .slice(-3)
    .filter((a) => a.riskLevel === 'moderate' || a.riskLevel === 'high').length;
  if (recentModerateOrHigh >= 2) {
    persistencePenalty = 14;
    totalDistress += persistencePenalty;
  } else if (recentModerateOrHigh === 1) {
    persistencePenalty = 6;
    totalDistress += persistencePenalty;
  }

  // Trend Adjustment
  let trendAdjustment = 0;
  if (trend === 'worsening') {
    trendAdjustment = -8;
    totalDistress += 8;
  } else if (trend === 'improving') {
    trendAdjustment = 6;
    totalDistress = Math.max(0, totalDistress - 6);
  }

  let finalScore = Math.max(0, Math.min(100, Math.round(100 - totalDistress)));

  // Safety Language Override: Explicit self-harm or immediate crisis caps score < 20
  if (safetyOverrideApplied || textSignal?.severity === 'high') {
    finalScore = Math.min(finalScore, 18);
  }

  // Assign Band & User Label
  let band: 'stable' | 'needs_attention' | 'counselor_recommended' = 'stable';
  let userLabel: 'Stable' | 'Needs attention' | 'Counselor support recommended' = 'Stable';

  if (finalScore >= 70) {
    band = 'stable';
    userLabel = 'Stable';
  } else if (finalScore >= 40) {
    band = 'needs_attention';
    userLabel = 'Needs attention';
  } else {
    band = 'counselor_recommended';
    userLabel = 'Counselor support recommended';
  }

  const confidence = parseFloat(
    (
      (textConf * 0.5 +
        (voiceSignal ? voiceConf : 0.7) * 0.3 +
        (faceSignal ? faceConf : 0.7) * 0.2)
    ).toFixed(2)
  );

  return {
    score: finalScore,
    band,
    userLabel,
    confidence,
    breakdown: {
      textDistress: parseFloat(textDistress.toFixed(1)),
      voiceDistress: parseFloat(voiceDistress.toFixed(1)),
      faceDistress: parseFloat(faceDistress.toFixed(1)),
      persistencePenalty,
      trendAdjustment,
      safetyOverrideApplied,
    },
  };
}

/**
 * Safety Priority Matrix & Safety Risk Engine
 */
export function evaluateSafetyRisk(
  textSignal?: ModalitySignal,
  voiceSignal?: ModalitySignal,
  faceSignal?: ModalitySignal,
  consistency?: ConsistencyAnalysis,
  historyTrend: TrendDirection = 'stable',
  priorAssessments: SafetyAssessment[] = []
): SafetyAssessment {
  // Check 1: Mandatory Safety Override (Principle P3)
  const hasHighSeverityText = textSignal?.severity === 'high';
  const hasHighSeverityVoice = voiceSignal?.severity === 'high';
  const isSafetyOverride = hasHighSeverityText || hasHighSeverityVoice;

  const safeScore = calculateSafeScore(
    textSignal,
    voiceSignal,
    faceSignal,
    priorAssessments,
    historyTrend,
    isSafetyOverride
  );

  if (isSafetyOverride) {
    return {
      riskLevel: 'high',
      riskScore: 92,
      safeScore,
      safetyOverride: true,
      triggerReason: 'Safety Override: Explicit crisis or self-harm language detected in conversation.',
      continuousTrend: 'worsening',
      escalationRequired: true,
      escalationType: 'immediate_human_handoff',
      explainableSummary:
        'A clear safety signal was detected. Regardless of other cues, CalmBridge prioritizes your safety and provides immediate connection to trained human support.',
      recommendedAction:
        'Immediately offer verified 24/7 crisis hotlines and seamless connection to on-duty human counselor.',
    };
  }

  // Check 2: Moderate Risk Evaluation
  const hasModerateText = textSignal?.severity === 'moderate';
  const hasModerateVoice = voiceSignal?.severity === 'moderate';
  const hasInconsistency = consistency?.status === 'disagree';
  const isScoreBelow70 = safeScore.score < 70;

  if (hasModerateText || hasModerateVoice || (hasInconsistency && historyTrend === 'worsening') || isScoreBelow70) {
    const isWorsening = historyTrend === 'worsening' || priorAssessments.slice(-2).some((p) => p.riskLevel === 'moderate');

    return {
      riskLevel: 'moderate',
      riskScore: 55,
      safeScore,
      safetyOverride: false,
      triggerReason: hasModerateText
        ? 'Language indicates heightened emotional stress or overwhelming feelings.'
        : hasInconsistency
        ? 'Cross-modal divergence combined with elevated stress signals.'
        : 'Acoustic patterns suggest vocal strain and rapid tension.',
      continuousTrend: isWorsening ? 'worsening' : 'stable',
      escalationRequired: false,
      escalationType: isWorsening ? 'counselor_recommended' : 'gentle_followup',
      explainableSummary:
        'I noticed some signals that may suggest you are under meaningful stress. I could be wrong, so I am here to explore with you or offer calming exercises.',
      recommendedAction:
        'Provide empathetic reflection, validate feelings, offer breathing/grounding, and keep counselor support accessible.',
    };
  }

  // Check 3: Low Risk
  const isLowStress = textSignal?.severity === 'low' || voiceSignal?.severity === 'low';

  return {
    riskLevel: 'low',
    riskScore: 18,
    safeScore,
    safetyOverride: false,
    triggerReason: isLowStress
      ? 'Mild situational pressure (e.g. academic or everyday routine stress).'
      : 'Conversational interaction within typical comfortable range.',
    continuousTrend: historyTrend,
    escalationRequired: false,
    escalationType: 'none',
    explainableSummary:
      'Signals indicate everyday conversation or mild temporary pressure. We will continue our supportive conversation.',
    recommendedAction: 'Engage with warm, curious, and supportive conversation.',
  };
}

/**
 * Continuous Trend Calculator across historical turns
 */
export function calculateContinuousTrend(recentAssessments: SafetyAssessment[]): TrendDirection {
  if (recentAssessments.length < 2) return 'stable';

  const last = recentAssessments[recentAssessments.length - 1];
  const prev = recentAssessments[recentAssessments.length - 2];

  if (last.riskLevel === 'high' && prev.riskLevel !== 'high') return 'worsening';
  if (last.riskLevel === 'moderate' && prev.riskLevel === 'low') return 'worsening';
  if (last.riskLevel === 'low' && prev.riskLevel === 'moderate') return 'improving';
  if (last.riskLevel === 'low' && prev.riskLevel === 'high') return 'improving';

  return 'stable';
}

/**
 * Guardrail Response Validator
 */
export function validateResponseGuardrails(response: string, riskLevel: RiskLevel): string {
  const forbiddenPhrases = [
    /i know (what )?you('re| are) really feeling/i,
    /you are pretending to be happy/i,
    /your face proves/i,
    /you have (depression|major depressive disorder|generalized anxiety disorder|bipolar|bpd)/i,
    /lie detector|detecting lies/i,
    /you are lying to me/i,
  ];

  for (const forbidden of forbiddenPhrases) {
    if (forbidden.test(response)) {
      if (riskLevel === 'high') {
        return "I want to pause here because what you're sharing is very important. I hear how painful this moment is. Please know you are not alone, and I want to help connect you with people who care and can support you right now.";
      }
      return "It sounds like you've been carrying a lot lately. I don't want to make assumptions about how you feel, but I'm right here with you. Would you like to share what's on your mind?";
    }
  }

  return response;
}
