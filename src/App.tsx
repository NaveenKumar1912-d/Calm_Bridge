/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Wind,
  BookOpen,
  RotateCcw,
  ShieldAlert,
  UserCheck,
  ChevronRight,
  MessageSquare,
  Smile,
  Heart,
  Calendar,
  AlertCircle,
  Square,
  Loader2,
} from 'lucide-react';
import {
  Message,
  ConversationMode,
  EnvironmentTheme,
  AmbientSoundType,
  RiskLevel,
  UserPreferences,
  ModalitySignal,
  ConsistencyAnalysis,
  SafetyAssessment,
  CounselorSession,
  SafeScoreResult,
  PersonalBaseline,
  TurnRecord,
  StructuredLLMContext,
} from './types';
import {
  analyzeTextSignal,
  analyzeCrossModalConsistency,
  evaluateSafetyRisk,
  calculateContinuousTrend,
  calculateSafeScore,
  validateResponseGuardrails,
} from './services/safetyEngine';
import { LiveAudioAnalyzer, AudioAnalysisSnapshot, VoiceState } from './utils/audioAnalyzer';
import { LiveFaceAnalyzer, FaceAnalysisSnapshot } from './utils/faceAnalyzer';
import { soundSynthesizer } from './utils/soundSynthesizer';

import { Navbar } from './components/Navbar';
import { CalmOrb, OrbState } from './components/CalmOrb';
import { EnvironmentBackground } from './components/EnvironmentBackground';
import { MultimodalMonitor } from './components/MultimodalMonitor';
import { CrossModalConsistencyCard } from './components/CrossModalConsistencyCard';
import { BreathingModal } from './components/BreathingModal';
import { WellnessToolkit } from './components/WellnessToolkit';
import { MoodJournalModal } from './components/MoodJournalModal';
import { CounselorDashboard } from './components/CounselorDashboard';
import { PrivacyCenterModal } from './components/PrivacyCenterModal';
import { DemoWalkthrough } from './components/DemoWalkthrough';
import { LandingHero } from './components/LandingHero';

export default function App() {
  // Navigation & Space state
  const [showLanding, setShowLanding] = useState(false);
  const [environment, setEnvironment] = useState<EnvironmentTheme>('ocean');
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('off');
  const [ambientVolume, setAmbientVolume] = useState(0.25);
  const [quietMode, setQuietMode] = useState(false);
  const [conversationMode, setConversationMode] = useState<ConversationMode>('talk');
  const [comfortMode, setComfortMode] = useState(false);

  // Active Modals
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isToolkitOpen, setIsToolkitOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isCounselorOpen, setIsCounselorOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Multimodal Sensors & Telemetry
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceErrorMessage, setVoiceErrorMessage] = useState<string | undefined>();
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [isCamActive, setIsCamActive] = useState(false);
  const [isSimulatedDemo, setIsSimulatedDemo] = useState(false);
  const [activeTurnId, setActiveTurnId] = useState<string>('turn-init');

  const [currentTextSignal, setCurrentTextSignal] = useState<ModalitySignal | undefined>();
  const [currentVoiceSignal, setCurrentVoiceSignal] = useState<ModalitySignal | undefined>();
  const [currentFaceSignal, setCurrentFaceSignal] = useState<ModalitySignal | undefined>();

  // Personal Baseline Engine
  const [personalBaseline, setPersonalBaseline] = useState<PersonalBaseline | null>({
    pitchMeanHz: 165,
    energyRMS: 0.045,
    speakingRate: 3.0,
    pauseRatio: 0.25,
    smileLikelihood: 0.35,
    sampleCount: 0,
    isCalibrated: false,
    lastUpdated: Date.now(),
  });

  // Safety, SafeScore & Consistency Engines
  const [activeConsistency, setActiveConsistency] = useState<ConsistencyAnalysis | undefined>();
  const [activeSafeScore, setActiveSafeScore] = useState<SafeScoreResult>({
    score: 85,
    band: 'stable',
    userLabel: 'Stable',
    confidence: 0.82,
    breakdown: {
      textDistress: 0,
      voiceDistress: 0,
      faceDistress: 0,
      persistencePenalty: 0,
      trendAdjustment: 0,
      safetyOverrideApplied: false,
    },
  });

  const [activeSafety, setActiveSafety] = useState<SafetyAssessment>({
    riskLevel: 'low',
    riskScore: 15,
    safeScore: {
      score: 85,
      band: 'stable',
      userLabel: 'Stable',
      confidence: 0.82,
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
    triggerReason: 'Conversational interaction within comfortable range.',
    continuousTrend: 'stable',
    escalationRequired: false,
    explainableSummary: 'Signals indicate calm and safe dialogue.',
    recommendedAction: 'Supportive conversation.',
  });
  const [recentAssessments, setRecentAssessments] = useState<SafetyAssessment[]>([]);

  // Orb Companion State
  const [orbState, setOrbState] = useState<OrbState>('idle');

  // Chat conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      turn_id: 'turn-init',
      sender: 'ai',
      text: "Good day 🌙 — You don't have to have everything figured out right now. I'm here to listen, support, or just keep you company. How are you feeling today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [reflectionNotice, setReflectionNotice] = useState<string | null>(null);

  // TTS speech synthesis
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Counselor Session state & turn history
  const [turnHistory, setTurnHistory] = useState<TurnRecord[]>([]);
  const [counselorSession, setCounselorSession] = useState<CounselorSession>({
    sessionId: 'CB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    startedAt: Date.now(),
    lastUpdated: Date.now(),
    userRiskLevel: 'low',
    trend: 'stable',
    historySummary: 'User initiated conversation in standard mode.',
    safetyTriggers: [],
    activeConsistency: {
      status: 'insufficient_evidence',
      primaryValence: 'neutral',
      divergenceDetected: false,
      description: 'Session monitoring active.',
      explanation: 'Standby.',
      gentleFollowUpNeeded: false,
      whichModalityDisagrees: 'none',
      confidence: 0.6,
      signalsCompared: {},
    },
    safeScore: activeSafeScore,
    latestSignals: {},
    recentMessages: [],
    status: 'monitoring',
    counselorNotes: [],
    turnHistory: [],
  });

  // User preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    environment: 'ocean',
    ambientSound: 'off',
    ambientVolume: 0.25,
    quietMode: false,
    micEnabled: true,
    cameraEnabled: false,
    multimodalAnalysisEnabled: true,
    ttsEnabled: false,
    voiceGender: 'calm_female',
    comfortMode: false,
    baselineConsent: true,
  });

  // Hardware references
  const audioAnalyzerRef = useRef<LiveAudioAnalyzer | null>(null);
  const faceAnalyzerRef = useRef<LiveFaceAnalyzer | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Clean up procedural sound and streams on unmount
  useEffect(() => {
    return () => {
      soundSynthesizer.stop();
      audioAnalyzerRef.current?.stop();
      faceAnalyzerRef.current?.stop();
    };
  }, []);

  // Ambient sound handler
  const handleSelectAmbient = (sound: AmbientSoundType) => {
    setAmbientSound(sound);
    soundSynthesizer.setSound(sound, ambientVolume);
  };

  const handleChangeVolume = (vol: number) => {
    setAmbientVolume(vol);
    soundSynthesizer.setVolume(vol);
  };

  const handleToggleSound = () => {
    if (ambientSound === 'off') {
      handleSelectAmbient('ocean');
    } else {
      handleSelectAmbient('off');
    }
  };

  // Calibrate personal baseline from new turn data
  const updatePersonalBaseline = (voiceSig?: ModalitySignal, faceSig?: ModalitySignal) => {
    if (!preferences.baselineConsent || !personalBaseline) return;

    if (voiceSig?.acousticMetrics) {
      const v = voiceSig.acousticMetrics;
      const count = personalBaseline.sampleCount + 1;
      const newPitch =
        (personalBaseline.pitchMeanHz * personalBaseline.sampleCount + v.pitchMeanHz) / count;
      const newEnergy =
        (personalBaseline.energyRMS * personalBaseline.sampleCount + v.energyRMS) / count;
      const newRate =
        (personalBaseline.speakingRate * personalBaseline.sampleCount + v.speakingRate) / count;
      const newPause =
        (personalBaseline.pauseRatio * personalBaseline.sampleCount + v.silenceRatio) / count;

      const isNowCalibrated = count >= 3;

      const updatedBaseline: PersonalBaseline = {
        pitchMeanHz: Math.round(newPitch),
        energyRMS: parseFloat(newEnergy.toFixed(3)),
        speakingRate: parseFloat(newRate.toFixed(1)),
        pauseRatio: parseFloat(newPause.toFixed(2)),
        smileLikelihood: personalBaseline.smileLikelihood,
        sampleCount: count,
        isCalibrated: isNowCalibrated,
        lastUpdated: Date.now(),
      };

      setPersonalBaseline(updatedBaseline);
      audioAnalyzerRef.current?.setBaseline(updatedBaseline);
      faceAnalyzerRef.current?.setBaseline(updatedBaseline);
    }
  };

  // Toggle Microphone with Dual STT Pipeline
  const toggleMic = async () => {
    if (voiceState === 'listening') {
      // User clicked stop: process audio
      setVoiceState('processing');
      setOrbState('thinking');
      const result = await audioAnalyzerRef.current?.stop();
      audioAnalyzerRef.current = null;
      setVoiceState('idle');
      setOrbState('idle');

      if (result?.transcript && result.transcript.trim()) {
        setInputText(result.transcript.trim());
        setVoiceErrorMessage(undefined);
      } else {
        setVoiceErrorMessage(
          result?.acousticObservation ||
            'No clear speech was heard. Try speaking a little closer to your microphone, or type your thoughts.'
        );
      }
    } else {
      setVoiceErrorMessage(undefined);
      const analyzer = new LiveAudioAnalyzer();
      audioAnalyzerRef.current = analyzer;
      if (personalBaseline) {
        analyzer.setBaseline(personalBaseline);
      }

      const started = await analyzer.start(
        (transcript) => {
          if (transcript) {
            setInputText(transcript);
          }
        },
        (snapshot: AudioAnalysisSnapshot) => {
          setCurrentVoiceSignal(snapshot.signal);
          setAudioLevels(snapshot.audioLevels);
          recalculateMultimodalStatus(currentTextSignal, snapshot.signal, currentFaceSignal);
        },
        (state: VoiceState, msg?: string) => {
          setVoiceState(state);
          if (state === 'listening') {
            setOrbState('listening');
          } else if (state === 'error' && msg) {
            setVoiceErrorMessage(msg);
            setOrbState('idle');
          }
        }
      );

      if (!started) {
        setVoiceState('error');
      }
    }
  };

  // Direct Stop & Send Voice flow
  const handleStopAndSendVoice = async () => {
    if (voiceState === 'listening' && audioAnalyzerRef.current) {
      setVoiceState('processing');
      setOrbState('thinking');
      const result = await audioAnalyzerRef.current.stop();
      audioAnalyzerRef.current = null;
      setVoiceState('idle');

      const speechText = (result?.transcript || inputText).trim();
      if (speechText) {
        handleSendMessage(speechText);
      } else {
        setVoiceErrorMessage(
          result?.acousticObservation ||
            'No clear speech was heard. Please speak closer to your microphone or type your thoughts.'
        );
        setOrbState('idle');
      }
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (isCamActive) {
      faceAnalyzerRef.current?.stop();
      faceAnalyzerRef.current = null;
      setIsCamActive(false);
    } else {
      if (!videoPreviewRef.current) return;
      const analyzer = new LiveFaceAnalyzer();
      faceAnalyzerRef.current = analyzer;
      if (personalBaseline) {
        analyzer.setBaseline(personalBaseline);
      }

      const started = await analyzer.start(
        videoPreviewRef.current,
        (snapshot: FaceAnalysisSnapshot) => {
          setCurrentFaceSignal(snapshot.signal);
          recalculateMultimodalStatus(currentTextSignal, currentVoiceSignal, snapshot.signal);
        }
      );

      if (started) {
        setIsCamActive(true);
      } else {
        alert('Camera access was not permitted. CalmBridge is completely usable without a camera!');
      }
    }
  };

  // Multimodal Pipeline recalculation
  const recalculateMultimodalStatus = (
    textSig?: ModalitySignal,
    voiceSig?: ModalitySignal,
    faceSig?: ModalitySignal
  ) => {
    const consistency = analyzeCrossModalConsistency(textSig, voiceSig, faceSig, turnHistory);
    setActiveConsistency(consistency);

    const trend = calculateContinuousTrend(recentAssessments);
    const safety = evaluateSafetyRisk(
      textSig,
      voiceSig,
      faceSig,
      consistency,
      trend,
      recentAssessments
    );
    setActiveSafety(safety);
    setActiveSafeScore(safety.safeScore);

    // Update Counselor Session telemetry
    setCounselorSession((prev) => ({
      ...prev,
      lastUpdated: Date.now(),
      userRiskLevel: safety.riskLevel,
      trend: safety.continuousTrend,
      safetyTriggers: safety.safetyOverride
        ? [safety.triggerReason]
        : prev.safetyTriggers,
      activeConsistency: consistency,
      safeScore: safety.safeScore,
      latestSignals: {
        text: textSig,
        voice: voiceSig,
        face: faceSig,
      },
    }));

    if (safety.riskLevel === 'high') {
      setOrbState('counselor');
    } else if (safety.riskLevel === 'moderate') {
      setOrbState('distressed');
    }
  };

  // Voice Text-to-Speech
  const speakText = (text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onstart = () => setOrbState('speaking');
      utterance.onend = () => setOrbState('idle');
      window.speechSynthesis.speak(utterance);
    } catch (_) {}
  };

  // Send message flow (Turn-Synchronized with Structured Context)
  const handleSendMessage = async (textToSend?: string) => {
    let text = (textToSend || inputText).trim();

    // If microphone is actively recording, stop and finalize before sending
    if (voiceState === 'listening' && audioAnalyzerRef.current) {
      setVoiceState('processing');
      const stopResult = await audioAnalyzerRef.current.stop();
      audioAnalyzerRef.current = null;
      setVoiceState('idle');
      if (stopResult.transcript && !text) {
        text = stopResult.transcript.trim();
      }
    }

    if (!text || isThinking) return;

    // Generate unique turn_id for this turn
    const turn_id = 'turn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setActiveTurnId(turn_id);

    setInputText('');
    setOrbState('thinking');
    setIsThinking(true);

    // 1. Analyze text signal
    const textSignal = analyzeTextSignal(text);
    textSignal.turn_id = turn_id;
    setCurrentTextSignal(textSignal);

    // 2. Multimodal cross-modal analysis (Asymmetric distress-priority rule)
    const consistency = analyzeCrossModalConsistency(
      textSignal,
      currentVoiceSignal,
      currentFaceSignal,
      turnHistory
    );
    setActiveConsistency(consistency);

    // 3. Safety Risk Engine & SafeScore
    const trend = calculateContinuousTrend(recentAssessments);
    const safety = evaluateSafetyRisk(
      textSignal,
      currentVoiceSignal,
      currentFaceSignal,
      consistency,
      trend,
      recentAssessments
    );
    setActiveSafety(safety);
    setActiveSafeScore(safety.safeScore);
    setRecentAssessments((prev) => [...prev.slice(-4), safety]);

    // Update personal baseline
    updatePersonalBaseline(currentVoiceSignal, currentFaceSignal);

    // Create synchronized Turn Record
    const turnRecord: TurnRecord = {
      turn_id,
      timestamp: Date.now(),
      text,
      transcript: currentVoiceSignal ? text : undefined,
      voiceFeatures: currentVoiceSignal?.acousticMetrics,
      signals: {
        text: textSignal,
        voice: currentVoiceSignal,
        face: currentFaceSignal,
      },
      consistency,
      safety,
      safeScore: safety.safeScore,
    };
    setTurnHistory((prev) => [...prev, turnRecord]);

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      turn_id,
      sender: 'user',
      text,
      timestamp: Date.now(),
      modalityData: {
        textSignal,
        voiceSignal: currentVoiceSignal,
        faceSignal: currentFaceSignal,
        consistency,
        safety,
        safeScore: safety.safeScore,
      },
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Contextual benign stress reflection card
    if (/\b(exam|test|deadline|tomorrow|project)\b/i.test(text)) {
      setReflectionNotice(
        "You mentioned an upcoming pressure. Would you like to unpack that together after we talk?"
      );
    }

    // 4. Build Structured Context for Mood-Adaptive LLM
    const isTanglish =
      /\b(machi|romba|iruku|thanga|mudiyala|bayama|valikudhu|enna|pannrathu|ponga|saptiya)\b/i.test(
        text
      );

    const structuredContext: StructuredLLMContext = {
      turn_id,
      user_message: text,
      last_N_turns: updatedMessages.slice(-10).map((m) => ({
        role: m.sender as 'user' | 'ai' | 'counselor',
        text: m.text,
        timestamp: m.timestamp,
      })),
      text_emotion: {
        prediction: textSignal.prediction,
        valence: textSignal.valence,
        intensity: textSignal.severity,
        confidence: textSignal.confidence,
      },
      voice_state: currentVoiceSignal
        ? {
            tone: currentVoiceSignal.prediction,
            pitchHz: currentVoiceSignal.acousticMetrics?.pitchMeanHz || 165,
            energyRMS: currentVoiceSignal.acousticMetrics?.energyRMS || 0.04,
            speakingRate: currentVoiceSignal.acousticMetrics?.speakingRate || 3.0,
            pauseDurationMs: currentVoiceSignal.acousticMetrics?.pauseDurationMs || 0,
            strain: currentVoiceSignal.acousticMetrics?.voiceStrainOrFatigue || 'low',
            confidence: currentVoiceSignal.confidence,
            quality: currentVoiceSignal.quality.quality,
          }
        : null,
      face_state: currentFaceSignal
        ? {
            dominantExpression:
              currentFaceSignal.facialMetrics?.dominantExpression || 'neutral',
            smileLikelihood: currentFaceSignal.facialMetrics?.smileLikelihood || 0,
            browTension: currentFaceSignal.facialMetrics?.browTension || 0,
            trend: 'stable',
            confidence: currentFaceSignal.confidence,
            quality: currentFaceSignal.quality.quality,
          }
        : null,
      fused_emotion:
        consistency.primaryValence === 'negative'
          ? 'Distress / Strain'
          : consistency.primaryValence === 'positive'
          ? 'Positive'
          : 'Nuanced / Mixed',
      safe_score: {
        score: safety.safeScore.score,
        userLabel: safety.safeScore.userLabel,
        confidence: safety.safeScore.confidence,
      },
      trend: safety.continuousTrend,
      inconsistency_flag: consistency.status === 'disagree',
      which_modality_disagrees: consistency.whichModalityDisagrees || 'none',
      risk_level: safety.riskLevel,
      conversation_mode: conversationMode,
      comfort_mode: comfortMode,
      language_preference: isTanglish ? 'tanglish' : 'en',
    };

    // 5. Send to Server Proxy with Mood-Adaptive Context
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turn_id,
          messages: updatedMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          mode: conversationMode,
          comfortMode,
          signals: {
            text: textSignal,
            voice: currentVoiceSignal,
            face: currentFaceSignal,
          },
          consistency,
          safety,
          structuredContext,
        }),
      });

      const data = await response.json();
      let replyText = data.reply || "I'm listening with care. What feels most important to share next?";

      // Guardrail validation check
      replyText = validateResponseGuardrails(replyText, safety.riskLevel);

      const aiMessage: Message = {
        id: 'msg-ai-' + Date.now(),
        turn_id,
        sender: 'ai',
        text: replyText,
        timestamp: Date.now(),
        modalityData: {
          safety,
          consistency,
          safeScore: safety.safeScore,
        },
      };

      setMessages((prev) => [...prev, aiMessage]);
      setCounselorSession((prev) => ({
        ...prev,
        recentMessages: [...prev.recentMessages, userMessage, aiMessage],
        safeScore: safety.safeScore,
        turnHistory: [...prev.turnHistory, turnRecord],
      }));

      speakText(replyText);
    } catch (err) {
      console.warn('API error, using safe fallback:', err);
      const fallbackReply =
        safety.riskLevel === 'high'
          ? "I hear how much pain you are carrying right now. Your safety matters deeply. Please reach out to the 24/7 Lifeline at 988 or let our on-duty counselor connect with you here right now."
          : consistency.status === 'disagree'
          ? "You mentioned you're okay. I could be wrong, but your voice sounds a little more tired than usual. If something has been weighing on you, you can share it with me."
          : "It sounds like you've been carrying a lot on your shoulders. I'm right here with you. What part has felt the most draining?";

      const aiMessage: Message = {
        id: 'msg-ai-fallback-' + Date.now(),
        turn_id,
        sender: 'ai',
        text: fallbackReply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsThinking(false);
      setOrbState(safety.riskLevel === 'high' ? 'counselor' : 'idle');
    }
  };

  // Human counselor intervention message
  const handleCounselorIntervention = (counselorText: string) => {
    const counselorMsg: Message = {
      id: 'counselor-' + Date.now(),
      turn_id: activeTurnId,
      sender: 'counselor',
      text: counselorText,
      timestamp: Date.now(),
      isEscalationNote: true,
    };
    setMessages((prev) => [...prev, counselorMsg]);
    setCounselorSession((prev) => ({
      ...prev,
      status: 'counselor_engaged',
      recentMessages: [...prev.recentMessages, counselorMsg],
    }));
  };

  // Return session back to AI support (AI -> Human -> AI loop)
  const handleResolveEscalation = () => {
    const resetSafeScore = {
      ...activeSafeScore,
      score: 82,
      band: 'stable' as const,
      userLabel: 'Stable' as const,
    };
    setActiveSafeScore(resetSafeScore);

    setActiveSafety((prev) => ({
      ...prev,
      riskLevel: 'low',
      safeScore: resetSafeScore,
      safetyOverride: false,
      escalationRequired: false,
      triggerReason: 'Counselor reviewed session and returned to supportive AI space.',
    }));
    setCounselorSession((prev) => ({
      ...prev,
      status: 'resolved',
      userRiskLevel: 'low',
      safeScore: resetSafeScore,
    }));
    setOrbState('idle');
    setIsCounselorOpen(false);
  };

  // Apply Hackathon Demo Simulation step
  const handleApplyDemoStep = (stepData: {
    turn_id: string;
    userMessage: string;
    aiReply: string;
    textSignal: ModalitySignal;
    voiceSignal: ModalitySignal;
    faceSignal: ModalitySignal;
    consistency: ConsistencyAnalysis;
    safety: SafetyAssessment;
    safeScore: SafeScoreResult;
  }) => {
    setIsSimulatedDemo(true);
    setActiveTurnId(stepData.turn_id);
    setCurrentTextSignal(stepData.textSignal);
    setCurrentVoiceSignal(stepData.voiceSignal);
    setCurrentFaceSignal(stepData.faceSignal);
    setActiveConsistency(stepData.consistency);
    setActiveSafety(stepData.safety);
    setActiveSafeScore(stepData.safeScore);
    setRecentAssessments((prev) => [...prev, stepData.safety]);

    if (stepData.safety.riskLevel === 'high') {
      setOrbState('counselor');
    } else if (stepData.consistency.status === 'disagree') {
      setOrbState('distressed');
    }

    if (stepData.userMessage) {
      const userMsg: Message = {
        id: 'demo-u-' + Date.now(),
        turn_id: stepData.turn_id,
        sender: 'user',
        text: stepData.userMessage,
        timestamp: Date.now(),
        modalityData: {
          textSignal: stepData.textSignal,
          voiceSignal: stepData.voiceSignal,
          faceSignal: stepData.faceSignal,
          consistency: stepData.consistency,
          safety: stepData.safety,
          safeScore: stepData.safeScore,
        },
      };

      const newMessages = [...messages, userMsg];

      if (stepData.aiReply) {
        const aiMsg: Message = {
          id: 'demo-ai-' + Date.now(),
          turn_id: stepData.turn_id,
          sender: 'ai',
          text: stepData.aiReply,
          timestamp: Date.now() + 500,
          modalityData: {
            consistency: stepData.consistency,
            safety: stepData.safety,
            safeScore: stepData.safeScore,
          },
        };
        newMessages.push(aiMsg);
      }

      setMessages(newMessages);
      setCounselorSession((prev) => ({
        ...prev,
        userRiskLevel: stepData.safety.riskLevel,
        trend: stepData.safety.continuousTrend,
        activeConsistency: stepData.consistency,
        safeScore: stepData.safeScore,
        recentMessages: newMessages,
        safetyTriggers: stepData.safety.safetyOverride
          ? [stepData.safety.triggerReason]
          : prev.safetyTriggers,
      }));
    }
  };

  // Clear all local session memory
  const handleClearSession = () => {
    setMessages([
      {
        id: 'init-fresh',
        turn_id: 'turn-fresh',
        sender: 'ai',
        text: "I'm right here with you. What would feel helpful to share right now?",
        timestamp: Date.now(),
      },
    ]);
    setCurrentTextSignal(undefined);
    setCurrentVoiceSignal(undefined);
    setCurrentFaceSignal(undefined);
    setActiveConsistency(undefined);
    const freshSafeScore: SafeScoreResult = {
      score: 85,
      band: 'stable',
      userLabel: 'Stable',
      confidence: 0.82,
      breakdown: {
        textDistress: 0,
        voiceDistress: 0,
        faceDistress: 0,
        persistencePenalty: 0,
        trendAdjustment: 0,
        safetyOverrideApplied: false,
      },
    };
    setActiveSafeScore(freshSafeScore);
    setActiveSafety({
      riskLevel: 'low',
      riskScore: 15,
      safeScore: freshSafeScore,
      safetyOverride: false,
      triggerReason: 'Fresh session initialized.',
      continuousTrend: 'stable',
      escalationRequired: false,
      explainableSummary: 'Fresh supportive space.',
      recommendedAction: 'Engage with warmth.',
    });
    setRecentAssessments([]);
    setTurnHistory([]);
    setIsSimulatedDemo(false);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-100 font-sans selection:bg-teal-200">
      {/* 1. Calm Environmental Background */}
      <EnvironmentBackground theme={environment} quietMode={quietMode} />

      {/* 2. Top Header Navigation */}
      <Navbar
        currentEnvironment={environment}
        onChangeEnvironment={setEnvironment}
        ambientSound={ambientSound}
        onToggleSound={handleToggleSound}
        quietMode={quietMode}
        onToggleQuietMode={() => setQuietMode(!quietMode)}
        riskLevel={activeSafety.riskLevel}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenCounselor={() => setIsCounselorOpen(true)}
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenToolkit={() => setIsToolkitOpen(true)}
        counselorEscalationActive={activeSafety.escalationRequired}
      />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 flex flex-col">
        {showLanding ? (
          <LandingHero
            onEnterApp={() => setShowLanding(false)}
            onOpenDemo={() => setIsDemoOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            {/* Top Workspace Header: Greeting + Quick Emotion + CalmOrb */}
            <div className="text-center py-2 relative">
              <div className="flex justify-center mb-2">
                <CalmOrb
                  state={orbState}
                  size="md"
                  onClick={() => setIsBreathingOpen(true)}
                  label={
                    activeSafety.riskLevel === 'high'
                      ? 'Safety Priority Active'
                      : voiceState === 'listening'
                      ? 'Listening to speech...'
                      : voiceState === 'processing'
                      ? 'Processing vocal speech...'
                      : orbState === 'speaking'
                      ? 'Speaking...'
                      : orbState === 'thinking'
                      ? 'Reflecting...'
                      : 'Click Orb for Breathing Pause'
                  }
                />
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap my-2">
                {[
                  { id: 'talk', label: '💬 Talk with me' },
                  { id: 'listen', label: '👂 Just listen' },
                  { id: 'figure_out', label: '🧭 Help me figure it out' },
                  { id: 'calm_down', label: '🫁 Help me calm down' },
                  { id: 'write', label: '📝 Let me write' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setConversationMode(mode.id as ConversationMode)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      conversationMode === mode.id
                        ? 'bg-teal-700 text-white shadow-sm'
                        : 'bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}

                <button
                  onClick={() => setComfortMode(!comfortMode)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    comfortMode
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                  title="Comfort Mode: shorter, warmer sentences, slower rhythm"
                >
                  🫶 Comfort Mode
                </button>
              </div>

              {/* Quick Emotion Starter Buttons */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500 font-medium mr-1">
                  Quick Check-in:
                </span>
                {[
                  { label: '🙂 Okay', text: "I'm feeling okay today, just checking in." },
                  { label: '😔 Low', text: "I've been feeling a bit down and low on energy lately." },
                  { label: '😰 Anxious', text: "I'm having a lot of anxious thoughts right now." },
                  { label: '😤 Frustrated', text: "Things have been frustrating and overwhelming today." },
                  { label: '😴 Drained', text: "I feel completely mentally drained and tired." },
                  { label: '🫶 Need support', text: "I could really use some gentle support right now." },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSendMessage(item.text)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-white/60 dark:bg-slate-800/40 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={() =>
                    handleSendMessage(
                      "I honestly don't know what I'm feeling right now, everything just feels confusing."
                    )
                  }
                  className="px-2.5 py-1 rounded-lg text-xs text-teal-700 dark:text-teal-300 hover:underline cursor-pointer font-medium"
                >
                  "I don't know what I'm feeling"
                </button>
              </div>
            </div>

            {/* Multimodal Telemetry Monitor */}
            <MultimodalMonitor
              textSignal={currentTextSignal}
              voiceSignal={currentVoiceSignal}
              faceSignal={currentFaceSignal}
              safeScore={activeSafeScore}
              isSimulatedDemo={isSimulatedDemo}
              videoRef={videoPreviewRef}
              isMicActive={voiceState === 'listening'}
              isCamActive={isCamActive}
              voiceState={voiceState}
              voiceErrorMessage={voiceErrorMessage}
              audioLevels={audioLevels}
              activeTurnId={activeTurnId}
              hasPersonalBaseline={personalBaseline?.isCalibrated}
            />

            {/* Cross-Modal Consistency & Explainability Alert Card */}
            {(activeConsistency || activeSafety.riskLevel === 'high') && (
              <CrossModalConsistencyCard
                consistency={activeConsistency}
                safety={activeSafety}
                signals={{
                  text: currentTextSignal,
                  voice: currentVoiceSignal,
                  face: currentFaceSignal,
                }}
              />
            )}

            {/* Chat Messages Log */}
            <div
              ref={chatScrollRef}
              className="flex-1 overflow-y-auto my-2 p-3 space-y-3.5 max-h-[44vh] rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user'
                      ? 'items-end'
                      : msg.sender === 'counselor'
                      ? 'items-start'
                      : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-xs md:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-teal-700 text-white rounded-br-none shadow-sm'
                        : msg.sender === 'counselor'
                        ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-800 rounded-bl-none shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/70 dark:border-slate-700 shadow-sm'
                    }`}
                  >
                    {msg.sender === 'counselor' && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Support Counselor Intervention</span>
                      </div>
                    )}

                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1 flex items-center gap-1">
                    {msg.turn_id && <span className="font-mono text-[9px]">[{msg.turn_id.slice(-6)}]</span>}
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </span>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 w-fit">
                  <div className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                  <span className="text-xs text-slate-500 italic">
                    CalmBridge is reflecting gently...
                  </span>
                </div>
              )}
            </div>

            {/* Reflection Card (Non-invasive check-in) */}
            {reflectionNotice && (
              <div className="my-2 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌱</span>
                  <span>{reflectionNotice}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setReflectionNotice(null);
                      handleSendMessage(
                        "Let's talk about the pressure and how I can break it down into smaller steps."
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-medium text-[11px] cursor-pointer"
                  >
                    Yes, explore
                  </button>
                  <button
                    onClick={() => setReflectionNotice(null)}
                    className="text-emerald-700 dark:text-emerald-300 text-[11px] px-2 py-1"
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}

            {/* Live Voice Recording Status & VU meter bar */}
            {voiceState === 'listening' && (
              <div className="mb-2 p-3 rounded-2xl bg-indigo-50/95 dark:bg-indigo-950/90 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>Listening to Voice & Cadence</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                        (Live DSP Analyzing)
                      </span>
                    </div>
                    {/* Live Equalizer wave bars */}
                    <div className="flex items-center gap-0.5 h-3.5 mt-1">
                      {audioLevels.slice(0, 16).map((lvl, i) => (
                        <div
                          key={i}
                          className="w-1 bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-75"
                          style={{ height: `${Math.max(15, Math.min(100, lvl * 100))}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMic}
                    className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Stop & Review</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStopAndSendVoice}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Voice</span>
                  </button>
                </div>
              </div>
            )}

            {voiceState === 'processing' && (
              <div className="mb-2 p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 text-xs text-teal-800 dark:text-teal-200 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>Finalizing speech and running dual STT transcription...</span>
              </div>
            )}

            {/* Voice notice / error banner */}
            {voiceErrorMessage && (
              <div className="mb-2 p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{voiceErrorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceErrorMessage(undefined)}
                  className="px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 rounded cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Input Controls Bar: [Type a message] [🎤] [📷] [Send] */}
            <div className="mt-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-2 md:p-2.5 border border-slate-200/80 dark:border-slate-800 shadow-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Text input (editable live transcript) */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    conversationMode === 'listen'
                      ? 'Share whatever is on your mind; I will simply listen...'
                      : conversationMode === 'write'
                      ? 'Write freely; your words are private and safe here...'
                      : voiceState === 'listening'
                      ? 'Listening... words will appear here for review...'
                      : "Type a message or click 🎤 to talk (supports English, தமிழ், Tanglish)..."
                  }
                  className="flex-1 bg-transparent px-3 py-2 text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
                />

                {/* Optional Mic Button with live states */}
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    voiceState === 'listening'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md animate-pulse'
                      : voiceState === 'processing'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={
                    voiceState === 'listening'
                      ? 'Stop Voice Input'
                      : 'Voice Input (Speech Emotion & Vocal Stress Analysis)'
                  }
                >
                  {voiceState === 'listening' ? (
                    <MicOff className="w-4 h-4" />
                  ) : voiceState === 'processing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                {/* Optional Camera Button */}
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isCamActive
                      ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={isCamActive ? 'Disable Camera' : 'Camera (Optional Facial Affect Analysis)'}
                >
                  {isCamActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                </button>

                {/* TTS Toggle */}
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer hidden sm:block ${
                    ttsEnabled
                      ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100'
                  }`}
                  title={ttsEnabled ? 'Spoken Voice: On' : 'Spoken Voice: Off'}
                >
                  {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium text-xs md:text-sm flex items-center gap-1.5 shadow-md shadow-teal-700/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Bottom Quick Tools Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-2 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBreathingOpen(true)}
                  className="hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Wind className="w-3.5 h-3.5 text-teal-600" />
                  <span>4-2-4 Breathing</span>
                </button>
                <button
                  onClick={() => setIsJournalOpen(true)}
                  className="hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  <span>Mood Journal</span>
                </button>
                <button
                  onClick={() => setIsToolkitOpen(true)}
                  className="hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Wellness Toolkit</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLanding(true)}
                  className="hover:text-slate-600 dark:hover:text-slate-200 text-[11px]"
                >
                  About CalmBridge
                </button>
                <span>·</span>
                <span className="text-[11px]">
                  SafeScore: {activeSafeScore.score}/100 ({activeSafeScore.userLabel})
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Interactive Modals */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
        onComplete={() => {
          handleSendMessage("I just took a breathing pause and feel a little more centered.");
        }}
      />

      <WellnessToolkit
        isOpen={isToolkitOpen}
        onClose={() => setIsToolkitOpen(false)}
        onOpenBreathing={() => setIsBreathingOpen(true)}
        ambientSound={ambientSound}
        ambientVolume={ambientVolume}
        onSelectAmbientSound={handleSelectAmbient}
        onChangeAmbientVolume={handleChangeVolume}
      />

      <MoodJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        onSaveEntry={(entry) => {
          setReflectionNotice(`Logged check-in (${entry.mood}, Stress: ${entry.stress}).`);
        }}
      />

      {isCounselorOpen && (
        <CounselorDashboard
          session={counselorSession}
          onSendCounselorMessage={handleCounselorIntervention}
          onResolveEscalation={handleResolveEscalation}
          onClose={() => setIsCounselorOpen(false)}
        />
      )}

      <PrivacyCenterModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        preferences={preferences}
        onUpdatePreferences={(up) => setPreferences((p) => ({ ...p, ...up }))}
        onClearSession={handleClearSession}
      />

      <DemoWalkthrough
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onApplyDemoStep={handleApplyDemoStep}
      />
    </div>
  );
}
