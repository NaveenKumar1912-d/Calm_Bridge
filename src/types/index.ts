/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ModalityType = 'text' | 'voice' | 'face';

export type QualityLevel = 'optimal' | 'moderate' | 'poor';

export interface QualityMetrics {
  quality: QualityLevel;
  confidencePenalty: number;
  details: string;
  // Specific checks
  lighting?: number; // 0-100
  faceDetected?: boolean;
  faceCentered?: boolean;
  blurDetected?: boolean;
  audioNoiseFloor?: number; // dB approx
  audioVolume?: number; // 0-100
  clippingDetected?: boolean;
  durationMs?: number;
}

export interface AcousticFeatures {
  pitchMeanHz: number;
  pitchMinHz: number;
  pitchMaxHz: number;
  pitchRangeHz: number;
  pitchVariability: number; // Std dev in Hz
  energyRMS: number;
  energyDb: number;
  speakingRate: number; // words or syllables/sec
  pauseCount: number;
  pauseDurationMs: number;
  silenceRatio: number; // 0.0 - 1.0
  jitterEstimate: number; // 0.0 - 1.0 vocal micro-instability
  spectralCentroidHz: number; // vocal brightness/strain
  voiceStrainOrFatigue: 'low' | 'moderate' | 'elevated';
  vocalArousal: 'calm' | 'flat_monotone' | 'animated' | 'agitated';
}

export interface VocalStressAnalysis {
  stressLevel: 'low' | 'moderate' | 'high';
  lowEnergyLevel: 'normal' | 'moderate' | 'severe';
  agitationLevel: 'calm' | 'moderate' | 'high';
  features: AcousticFeatures;
  confidence: number;
  audioQuality: QualityMetrics;
  timestamp: number;
  deviationFromBaseline?: {
    pitchDeviationPercent: number;
    energyDeviationPercent: number;
    speedDeviationPercent: number;
    pauseRatioDeviationPercent: number;
    isSignificantDeviation: boolean;
  };
}

export interface ExpressionProbabilities {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  surprise: number;
  fear: number;
  disgust: number;
}

export interface ActionUnitCues {
  browLowering: number; // Corrugator activity / tension / frowning
  browRaising: number; // Surprise / elevated worry
  lipCornerDrop: number; // Depressor anguli oris / sadness
  lipCornerPull: number; // Zygomatic major / smiling
  eyeOpenness: number; // Wide vs squinting
  blinkRatePerMin: number;
  mouthTension: number;
  headPosture: 'upright' | 'head_down' | 'tilted';
  gazeAvoidance: boolean;
}

export interface FacialAffectAnalysis {
  expressions: ExpressionProbabilities;
  dominantExpression: keyof ExpressionProbabilities;
  actionUnits: ActionUnitCues;
  expressiveness: number;
  faceStability: number; // Head motion stability 0-1
  temporalChange: {
    expressionShift: boolean;
    suddenDropInPositiveAffect: boolean;
    sustainedFlatAffect: boolean;
    microChangesDuringSpeech: boolean;
  };
  quality: QualityMetrics;
  confidence: number;
  timestamp: number;
}

export interface ModalitySignal {
  modality: ModalityType;
  prediction: string; // e.g. "Calm", "Anxiety", "Sadness", "Possible Stress", "Positive", "Neutral"
  valence: 'positive' | 'neutral' | 'negative' | 'mixed';
  confidence: number; // 0.0 - 1.0
  severity: 'none' | 'low' | 'moderate' | 'high';
  quality: QualityMetrics;
  reason: string;
  timestamp: number;
  turn_id?: string;
  acousticMetrics?: AcousticFeatures;
  facialMetrics?: {
    smileLikelihood: number;
    browTension: number;
    expressiveness: number;
    faceStability: number;
    dominantExpression?: string;
    expressions?: ExpressionProbabilities;
  };
}

export type ConsistencyStatus = 'agree' | 'partially_agree' | 'disagree' | 'insufficient_evidence';

export interface ConsistencyAnalysis {
  status: ConsistencyStatus;
  primaryValence: 'positive' | 'neutral' | 'negative' | 'mixed' | 'inconclusive';
  divergenceDetected: boolean;
  description: string;
  explanation: string;
  gentleFollowUpNeeded: boolean;
  whichModalityDisagrees?: 'voice' | 'face' | 'text' | 'none';
  suggestedCheckInPrompt?: string;
  signalsCompared: {
    textValence?: string;
    voiceValence?: string;
    faceValence?: string;
  };
  confidence: number;
}

export type RiskLevel = 'low' | 'moderate' | 'high';
export type TrendDirection = 'improving' | 'stable' | 'worsening';
export type SafeScoreBand = 'stable' | 'needs_attention' | 'counselor_recommended';

export interface SafeScoreResult {
  score: number; // 0 - 100 (Internal numeric, higher = safer/more settled)
  band: SafeScoreBand;
  userLabel: 'Stable' | 'Needs attention' | 'Counselor support recommended';
  confidence: number; // 0.0 - 1.0
  breakdown: {
    textDistress: number;
    voiceDistress: number;
    faceDistress: number;
    persistencePenalty: number;
    trendAdjustment: number;
    safetyOverrideApplied: boolean;
  };
}

export interface SafetyAssessment {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100 (Internal only)
  safeScore: SafeScoreResult;
  safetyOverride: boolean;
  triggerReason: string;
  continuousTrend: TrendDirection;
  escalationRequired: boolean;
  escalationType?: 'none' | 'gentle_followup' | 'counselor_recommended' | 'immediate_human_handoff';
  explainableSummary: string; // Plain-language "Why CalmBridge checked in"
  recommendedAction: string;
}

export interface PersonalBaseline {
  pitchMeanHz: number;
  energyRMS: number;
  speakingRate: number;
  pauseRatio: number;
  smileLikelihood: number;
  sampleCount: number;
  isCalibrated: boolean;
  lastUpdated: number;
}

export interface TurnRecord {
  turn_id: string;
  timestamp: number;
  text: string;
  transcript?: string;
  voiceFeatures?: AcousticFeatures;
  faceWindow?: FacialAffectAnalysis[];
  signals: {
    text?: ModalitySignal;
    voice?: ModalitySignal;
    face?: ModalitySignal;
  };
  consistency?: ConsistencyAnalysis;
  safety?: SafetyAssessment;
  safeScore?: SafeScoreResult;
}

export type ConversationMode =
  | 'talk'
  | 'listen'
  | 'figure_out'
  | 'calm_down'
  | 'write'
  | 'comfort';

export type EnvironmentTheme = 'ocean' | 'nature' | 'night' | 'cloud' | 'sunset';

export type AmbientSoundType = 'off' | 'rain' | 'ocean' | 'forest' | 'fireplace' | 'ambient';

export interface Message {
  id: string;
  turn_id?: string;
  sender: 'user' | 'ai' | 'counselor' | 'system';
  text: string;
  timestamp: number;
  languageDetected?: 'en' | 'ta' | 'tanglish' | 'other';
  modalityData?: {
    textSignal?: ModalitySignal;
    voiceSignal?: ModalitySignal;
    faceSignal?: ModalitySignal;
    consistency?: ConsistencyAnalysis;
    safety?: SafetyAssessment;
    safeScore?: SafeScoreResult;
  };
  isEscalationNote?: boolean;
}

export interface StructuredLLMContext {
  turn_id: string;
  user_message: string;
  last_N_turns: { role: 'user' | 'ai' | 'counselor'; text: string; timestamp: number }[];
  text_emotion: { prediction: string; valence: string; intensity: string; confidence: number };
  voice_state: {
    tone: string;
    pitchHz: number;
    energyRMS: number;
    speakingRate: number;
    pauseDurationMs: number;
    strain: string;
    confidence: number;
    quality: string;
  } | null;
  face_state: {
    dominantExpression: string;
    smileLikelihood: number;
    browTension: number;
    trend: string;
    confidence: number;
    quality: string;
  } | null;
  fused_emotion: string;
  safe_score: {
    score: number;
    userLabel: string;
    confidence: number;
  };
  trend: TrendDirection;
  inconsistency_flag: boolean;
  which_modality_disagrees: 'voice' | 'face' | 'text' | 'none';
  risk_level: RiskLevel;
  conversation_mode: ConversationMode;
  comfort_mode: boolean;
  language_preference: 'en' | 'ta' | 'tanglish';
}

export interface CounselorSession {
  sessionId: string;
  startedAt: number;
  lastUpdated: number;
  userRiskLevel: RiskLevel;
  trend: TrendDirection;
  historySummary: string;
  safetyTriggers: string[];
  activeConsistency: ConsistencyAnalysis;
  safeScore: SafeScoreResult;
  latestSignals: {
    text?: ModalitySignal;
    voice?: ModalitySignal;
    face?: ModalitySignal;
  };
  recentMessages: Message[];
  status: 'monitoring' | 'triage_needed' | 'counselor_engaged' | 'resolved';
  counselorNotes: string[];
  turnHistory: TurnRecord[];
}

export interface UserPreferences {
  environment: EnvironmentTheme;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  quietMode: boolean;
  micEnabled: boolean;
  cameraEnabled: boolean;
  multimodalAnalysisEnabled: boolean;
  ttsEnabled: boolean;
  voiceGender: 'calm_female' | 'calm_male';
  comfortMode: boolean;
  baselineConsent: boolean;
}
