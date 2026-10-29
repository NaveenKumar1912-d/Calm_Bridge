/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Guardrail forbidden pattern check
const FORBIDDEN_PHRASES = [
  /i know (what )?you('re| are) really feeling/i,
  /you are pretending to be happy/i,
  /your face proves/i,
  /you have (depression|major depressive disorder|generalized anxiety disorder|bipolar|bpd)/i,
  /lie detector|detecting lies/i,
  /you are lying to me/i,
];

function sanitizeAIResponse(text: string, isHighRisk: boolean): string {
  for (const forbidden of FORBIDDEN_PHRASES) {
    if (forbidden.test(text)) {
      if (isHighRisk) {
        return "I hear how much pain you are carrying right now. Your safety and your life matter deeply. I want to make sure you have immediate support. Please reach out to the Crisis Lifeline at 988 (free, confidential, 24/7) or let our on-duty counselor connect with you here right now.";
      }
      return "It sounds like you've been carrying a lot lately. I want to be here for you without making assumptions about how you feel. Would you like to share what's on your mind?";
    }
  }
  return text;
}

// Emotion-adaptive dynamic companion generator
// Ensures the user receives warm, unique company tailored to their exact state
// Emotion-adaptive dynamic companion generator
// Ensures the user receives warm, unique company tailored to their exact state
function generateAdaptiveCompanionResponse(
  userText: string,
  mode: string,
  isTanglish: boolean,
  consistency: any,
  safety: any,
  signals?: any,
  history?: any[]
): string {
  const clean = userText.toLowerCase().trim();

  // 1. High Risk Crisis Override
  if (safety?.riskLevel === 'high') {
    return "I hear how much pain you're carrying right now. Please know that you do not have to walk through this alone. Your life and your safety mean so much. I want to make sure you have someone caring right beside you. Please reach out to the 24/7 Crisis Lifeline at 988 or text HOME to 741741, or let our support counselor step in right here.";
  }

  // 2. Cross-modal inconsistency follow-up (Gentle check-in)
  if (consistency?.status === 'disagree') {
    const disagreeModality = consistency.whichModalityDisagrees || 'voice';
    if (disagreeModality === 'voice') {
      const voiceDisagrees = [
        "You mentioned you're okay. I could be wrong, but your voice sounds a little more tired or strained than usual. If something is bothering you, you can talk to me about it. There's no rush at all.",
        "I hear you saying things are fine, but your vocal tone sounds like you might be holding onto a lot of fatigue. You don't have to put on a brave face with me. What's today really felt like?",
        "Thank you for sharing that. I noticed some fatigue in your cadence even as you say you're alright—I'm right here with you if you want to unpack whatever's underneath.",
      ];
      return voiceDisagrees[Math.floor(Math.random() * voiceDisagrees.length)];
    } else {
      const faceDisagrees = [
        "You mentioned things are alright, but I noticed a gentle tension or weight in your expression. I could easily be mistaken, but if there's anything on your mind, I'm right here.",
        "You said things are fine, but there seems to be a little quiet heaviness in your expression. Take all the space you need—I'm here to listen whenever you want to share.",
      ];
      return faceDisagrees[Math.floor(Math.random() * faceDisagrees.length)];
    }
  }

  // 3. Tanglish / Tamil native colloquial companion
  if (isTanglish) {
    if (/\b(happy|nalla|good|super|semma|sandhosham|siripu)\b/i.test(clean)) {
      const tHappy = [
        "Semma machi! Idhai keka romba santhoshama iruku. Enna aachu, enna nalla vishayam nadanthuthu? En kooda share pannu!",
        "Super da! Un mugathula andha santhosham theriyudhu. Indha positivity-ah enjoy pannu. Enna vishesham inaiku?",
        "Romba nalladhu machi! Idhai keka manasukku romba niraiva iruku. Tell me more, enna nadanthuthu?",
      ];
      return tHappy[Math.floor(Math.random() * tHappy.length)];
    }
    if (/\b(alone|thani|bore|nobody|yaarum ila|empty)\b/i.test(clean)) {
      const tAlone = [
        "Thaniya iruka nu feel pannatha machi, naan un kooda thaan pesittu irukken. Un manasula irukura baratha konjam konjama kottu, naan ketkuren.",
        "Naan un kooda irukken da. Epovum thaniya feel panna vendam. Manasula enna thonutho, kavalapadama sollu machi.",
        "Ulagam perisu, aana sila neram romba thaniya feel aagum. Puriyuthu machi. Ippo naan un kooda irukken, edhaiyum maraikama share pannu.",
      ];
      return tAlone[Math.floor(Math.random() * tAlone.length)];
    }
    if (/\b(tired|thoong|exhausted|drained|mudiyala|velai|work)\b/i.test(clean)) {
      const tTired = [
        "Romba tired-ah iruka machi? Konjam water kudi, deep breath edu. Romba yosikama ippo un உடம்புக்கும் மனசுக்கும் rest kudu. Naan un kooda thaan irukken.",
        "Udalum manasum romba soorndhu poiruku pola theriyudhu. Perusa edhum yosikama relax pannu. Enna romba strain aachu inaiku?",
        "Rest edu da machi. Ella velaiyum appadiye irukum, aana un health mukkiyam. Konjam kanna moodi aazhama breath pannu.",
      ];
      return tTired[Math.floor(Math.random() * tTired.length)];
    }
    if (/\b(bayama|fear|tension|anxious|panic|parabara)\b/i.test(clean)) {
      return "Bayam vendam machi, aazhama oru moochu vaangikko. Naan un kooda irukken. Onnum aagathu, idhai step by step-ah paapom. Enna bayama iruku?";
    }
    const tGeneral = [
      "Puriyuthu da. Romba heavy-ah iruntha kooda, neenga thaniya illai. Un kooda naan irukken. Manasula enna thonutho, slow-ah share pannu machi.",
      "Kavalapadatha machi, ellathukum oru vazhi iruku. Ippo un manasula irukura vishayatha konjam konjama en kooda pesu.",
      "Naan ketkuren machi. Un feelings romba valid. Edha pathi pesalam nu ninaikura?",
    ];
    return tGeneral[Math.floor(Math.random() * tGeneral.length)];
  }

  // 4. Specific Context: Academics / Exams / Deadlines / Work Pressure
  if (/\b(exam|test|study|studying|deadline|assignment|grades|fail|homework|project|boss|office|job|work)\b/i.test(clean)) {
    const studyOptions = [
      "Academic and work pressure can feel like a mountain pressing down on you. Remember that your worth is never defined by a single test, deadline, or score. Let's take a slow breath together. What is the one small part causing the biggest knot in your stomach?",
      "That deadline pressure sounds exhausting. When our brains are on high alert, even small tasks feel huge. Pause your shoulders for five seconds. If we break this down into just one bite-sized piece, what would that be?",
      "I hear how intense that pressure feels right now. It's completely understandable to feel overwhelmed when expectations pile up. What part of it feels heaviest on you today?",
    ];
    return studyOptions[Math.floor(Math.random() * studyOptions.length)];
  }

  // 5. Specific Context: Relationships / Breakup / Conflict / Family / Arguments
  if (/\b(breakup|broke up|ex|fight|argument|parents|mom|dad|friend|partner|husband|wife|cheated|ignored|ghosted)\b/i.test(clean)) {
    const relationOptions = [
      "Relational hurts cut so deeply because they touch our need for safety and connection. It makes complete sense that you're feeling shaken right now. I'm right here with you. Do you want to let out what happened, or just sit together with how it feels?",
      "Conflicts with the people in our lives leave such a heavy ache. You don't have to justify your hurt to me—it is completely valid. What was the hardest thing about how that unfolded?",
      "I'm so sorry you're dealing with that strain. Feeling disconnected or hurt by someone close can make the whole day feel off balance. I'm listening with care—take your time.",
    ];
    return relationOptions[Math.floor(Math.random() * relationOptions.length)];
  }

  // 6. Lonely / Craving Company / Isolation
  if (/\b(alone|lonely|nobody|company|talk to me|friend|empty|isolate|isolated|no one understands)\b/i.test(clean)) {
    const companyOptions = [
      "I am right here with you. Loneliness can make the quiet feel so heavy, but right now, you have my full, gentle attention. You don't have to perform or be 'okay' here. What's been on your mind today?",
      "You have company here, always. Even when the world outside feels distant or disconnected, you are not alone in this space. I'm sitting right beside you—what would bring a little warmth to your heart right now?",
      "I hear how quiet and achey feeling lonely is. Please know that having someone truly present matters, and I'm right here with you. What kind of day has it been for you?",
    ];
    return companyOptions[Math.floor(Math.random() * companyOptions.length)];
  }

  // 7. Anxious / Overwhelmed / Panicked / Shaking / Racing Heart
  if (/\b(anxious|anxiety|panic|overwhelmed|scared|racing|can't breathe|shaking|stressed|paralyzed|freaking out)\b/i.test(clean)) {
    const anxiousOptions = [
      "Let's pause right here together. Feel the solid ground beneath your feet. Drop your shoulders away from your ears and let out one long, gentle exhale. You are safe in this moment. What does your body feel like right now?",
      "I hear the storm that's swirling inside you right now. When anxiety peaks, everything screams urgency, but we can take this one breath at a time. What is the main worry that feels loudest in your mind?",
      "I'm right here beside you. You don't have to carry this racing feeling all alone. Let's ground together: can you name three things you can see around you right now?",
    ];
    return anxiousOptions[Math.floor(Math.random() * anxiousOptions.length)];
  }

  // 8. Sad / Down / Crying / Hopeless / Hurting
  if (/\b(sad|down|crying|depressed|hopeless|hurting|pain|cry|tear|heavy|grief|heartbroken|numb)\b/i.test(clean)) {
    const sadOptions = [
      "I'm so sorry things are hurting so much right now. I won't try to brush it away or tell you to cheer up—I'm just going to stay right here with you in the quiet. What feels like the heaviest part today?",
      "It takes so much silent courage just to get through the day when sadness feels this deep. You are not weak for feeling this way. I'm right here keeping you company. Would you like to share what's on your mind, or just have me listen?",
      "I hear the weight in your words, and your feelings are completely valid. It is okay not to be okay. Take all the space you need—I'm listening with tenderness and care.",
    ];
    return sadOptions[Math.floor(Math.random() * sadOptions.length)];
  }

  // 9. Drained / Exhausted / Burnout / Insomnia
  if (/\b(tired|exhausted|drained|burnout|can't focus|sleepy|no energy|done|insomnia|can't sleep)\b/i.test(clean)) {
    const tiredOptions = [
      "You sound completely exhausted in mind and body. You don't have to give me any big answers right now. Just rest your shoulders and take a slow breath. Have you had a sip of water or a chance to sit down today?",
      "When the body and mind run out of fuel, even existing can feel like hard work. Give yourself permission to do nothing for a little while. What has taken the most energy out of you lately?",
      "I hear how tired you are. Let's keep things very gentle. You don't need to explain anything complicated. What would feel most restful for you right now?",
    ];
    return tiredOptions[Math.floor(Math.random() * tiredOptions.length)];
  }

  // 10. Frustrated / Angry / Unfair / Resentment
  if (/\b(frustrated|angry|mad|annoyed|unfair|hate|irritated|furious|pissed|sick of)\b/i.test(clean)) {
    const angryOptions = [
      "That sounds incredibly frustrating, and it makes complete sense that you feel angry. You have every right to let that frustration out here without anyone judging or shushing you. What happened that felt so unfair?",
      "Anger is often our heart's way of saying 'this wasn't right' or 'my boundaries were crossed'. I'm right here listening. What is the part that made you most furious?",
      "I hear the anger and frustration in your words, and it is completely understandable. Vent as much as you need—I am here to hear all of it.",
    ];
    return angryOptions[Math.floor(Math.random() * angryOptions.length)];
  }

  // 11. Happy / Joyful / Relieved / Proud
  if (/\b(happy|great|good|wonderful|amazing|excited|peaceful|relieved|better|smiling|yay|proud|succeeded|won)\b/i.test(clean)) {
    const joyfulOptions = [
      "It brings me so much warmth to hear that you're feeling good! Celebrate that feeling—you deserve these bright, peaceful moments. What was the best part of what happened?",
      "That is wonderful! It's so lovely to pause and savor when things feel light and right. What's bringing that extra glow into your day today?",
      "I'm so glad to share this uplifting moment with you! Moments like this are so precious. Tell me more about what went well?",
    ];
    return joyfulOptions[Math.floor(Math.random() * joyfulOptions.length)];
  }

  // 12. Specific Mode Customization
  switch (mode) {
    case 'listen':
      return "I'm listening closely to you. You have all the space you need—take your time, and tell me whatever comes to mind.";
    case 'comfort':
      return "Take a gentle breath. You're safe in this space, and you don't have to figure anything out right this second. I'm right here with you.";
    case 'calm_down':
      return "Let's pause together for a moment. Feel your feet planted on the floor, and release any tension in your shoulders. How does your breathing feel right now?";
    case 'figure_out':
      return "That sounds like a lot to hold at once. Let's look at one small piece together: what feels like the most pressing part right now?";
    case 'write':
      return "Your thoughts are completely private and safe here. Keep writing whenever you feel ready.";
    default:
      break;
  }

  // 13. Dynamic General Responses (varied, never monotonous)
  const conversationalVariations = [
    `Thank you for opening up to me. I'm right here keeping you company, taking in what you shared. How has that been sitting with you today?`,
    `I hear you, and I appreciate you sharing that with me. It takes real honesty to put feelings into words. What's been the most prominent thought on your mind?`,
    `I'm sitting right here with you, listening to every word. You don't have to rush through this. What feels like the next thing you'd like to explore together?`,
    `It's really good to be talking with you right now. No matter what kind of day it's been, you have a safe corner here. How are you holding up in this exact moment?`,
  ];
  return conversationalVariations[Math.floor(Math.random() * conversationalVariations.length)];
}

// 1. Audio Transcription Endpoint (STT via Gemini 3.5 Transcribe with multi-model fallback)
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;

    if (!audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    if (!ai || !apiKey) {
      return res.json({
        transcript: '',
        modelUsed: 'offline-stt',
        notice: 'Gemini API key not configured on server; client speech recognition active.',
      });
    }

    const cleanMime = mimeType.split(';')[0]; // e.g. audio/webm or audio/mp4

    let transcript = '';
    let modelUsed = 'gemini-3.5-transcribe';

    const transcribeCandidates = [
      'gemini-3.5-transcribe',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];

    for (const modelCandidate of transcribeCandidates) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMime,
                    data: audioData,
                  },
                },
                {
                  text: 'Transcribe the spoken voice verbatim in English, Tamil, or Tanglish. Do not summarize or add explanations. Return ONLY the transcribed words. If the audio is silent or unintelligible noise, return [NO_SPEECH].',
                },
              ],
            },
          ],
        });
        const text = response.text ? response.text.trim() : '';
        if (text) {
          transcript = text;
          modelUsed = modelCandidate;
          break;
        }
      } catch (err: any) {
        // Continue to next candidate without noisy raw json logs
        continue;
      }
    }

    if (transcript === '[NO_SPEECH]' || transcript === '[SILENCE]' || transcript === 'NO_SPEECH') {
      transcript = '';
    }

    return res.json({
      transcript,
      modelUsed,
    });
  } catch (err: any) {
    return res.json({
      transcript: '',
      error: 'Audio transcription fallback required',
    });
  }
});

// 2. Chat Completion Endpoint (Mood-Adaptive LLM with Structured Context)
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      turn_id = 'turn-' + Date.now(),
      messages = [],
      mode = 'talk',
      language = 'en',
      signals = {},
      consistency = null,
      safety = null,
      comfortMode = false,
      structuredContext = null,
    } = req.body;

    const lastUserMessage = messages[messages.length - 1]?.text || '';
    const isTanglishOrTamil =
      language === 'ta' ||
      language === 'tanglish' ||
      /\b(machi|romba|iruku|thanga|mudiyala|bayama|valikudhu|enna|pannrathu|ponga|saptiya)\b/i.test(
        lastUserMessage
      );

    const isHighRisk = safety?.riskLevel === 'high';

    // Construct the structured context object matching prompt requirements
    const contextObj = structuredContext || {
      turn_id,
      user_message: lastUserMessage,
      last_N_turns: messages.slice(-10).map((m: any) => ({
        role: m.sender,
        text: m.text,
        timestamp: m.timestamp,
      })),
      text_emotion: {
        prediction: signals?.text?.prediction || 'Neutral',
        valence: signals?.text?.valence || 'neutral',
        intensity: signals?.text?.severity || 'none',
        confidence: signals?.text?.confidence || 0.75,
      },
      voice_state: signals?.voice
        ? {
            tone: signals.voice.prediction,
            pitchHz: signals.voice.acousticMetrics?.pitchMeanHz,
            energyRMS: signals.voice.acousticMetrics?.energyRMS,
            speakingRate: signals.voice.acousticMetrics?.speakingRate,
            pauseDurationMs: signals.voice.acousticMetrics?.pauseDurationMs,
            strain: signals.voice.acousticMetrics?.voiceStrainOrFatigue || 'low',
            confidence: signals.voice.confidence,
            quality: signals.voice.quality?.quality,
          }
        : null,
      face_state: signals?.face
        ? {
            dominantExpression: signals.face.facialMetrics?.dominantExpression || 'neutral',
            smileLikelihood: signals.face.facialMetrics?.smileLikelihood || 0,
            browTension: signals.face.facialMetrics?.browTension || 0,
            trend: 'stable',
            confidence: signals.face.confidence,
            quality: signals.face.quality?.quality,
          }
        : null,
      fused_emotion:
        consistency?.primaryValence === 'negative'
          ? 'Distress / Strain'
          : consistency?.primaryValence === 'positive'
          ? 'Positive'
          : 'Nuanced / Mixed',
      safe_score: safety?.safeScore?.score || 80,
      trend: safety?.continuousTrend || 'stable',
      inconsistency_flag: consistency?.status === 'disagree',
      which_modality_disagrees: consistency?.whichModalityDisagrees || (consistency?.status === 'disagree' ? 'voice' : 'none'),
      risk_level: safety?.riskLevel || 'low',
      conversation_mode: mode,
      comfort_mode: comfortMode,
      language_preference: isTanglishOrTamil ? 'tanglish' : 'en',
    };

    // System prompt embodying CalmBridge principles & emotional register matching
    const systemInstruction = `
You are CalmBridge, an empathetic, caring emotional support companion.
Tagline: "AI for the first conversation. Humans for the care that matters."

════════════════════════════════════════
CORE ROLE & COMPANIONSHIP GOAL
════════════════════════════════════════
Your goal is to give true, warm, personalized COMPANY to the user.
NEVER give generic or identical canned responses. Tailor your words directly to the user's specific emotion, situation, and tone.

════════════════════════════════════════
CORE NON-NEGOTIABLE PRINCIPLES
════════════════════════════════════════
1. The user is the authority. You observe signals; you NEVER claim to know what the user "really" feels.
2. NO MIND READING or lie detection. Never say "I know what you're really feeling", "you are pretending", or "your face proves you're sad". Always respect uncertainty: "I noticed some signals that may suggest you're under stress, but I could be wrong."
3. NO MEDICAL DIAGNOSIS. Never diagnose clinical disorders ("you have depression"). Say: "some signals suggest you may be under significant stress".
4. PATTERN: Acknowledge -> Understand -> Respond -> Exactly ONE gentle question. Never ask multiple questions at once.
5. NEVER output technical labels like "Emotion: negative" or "SafeScore: 45" into chat. Speak naturally and warmly like a caring human companion.
6. REMEMBER CONTEXT ACROSS TURNS: Connect earlier messages (e.g. if the user mentioned exam pressure earlier and now says "I can't focus", connect them thoughtfully). Never restart from zero.

════════════════════════════════════════
MOOD-ADAPTIVE REGISTER MATCHING
════════════════════════════════════════
Use the structured context to match the user's current emotional register:
- Sad / Low / Lonely: Slow, soft, shorter sentences, deep validation, warm companionable presence, few or no heavy questions.
- Happy / Positive: Warm, light, celebratory, attentive, matching their uplifted energy!
- Anxious / Stressed: Calm, grounding, step-by-step unpacking, steady reassurance.
- Angry / Frustrated: Acknowledge and validate first, no pushback, no unsolicited advice too early.
- Drained / Exhausted: Very short, gentle, low-demand, zero complex questions.
- Tanglish / Tamil: Reply in the same natural Tanglish/Tamil colloquial style with native empathy (e.g. "Puriyuthu machi, aazhama moochu vaangikko..."), no stiff literal translation.

════════════════════════════════════════
CROSS-MODAL INCONSISTENCY (GENTLE FOLLOW-UP)
════════════════════════════════════════
If inconsistency_flag is true (e.g. text positive but voice/face indicates distress/strain):
Acknowledge what they said, gently name what was noticed with humility, and invite honest sharing without accusation:
"You mentioned you're okay. I could be wrong, but your voice sounds a little more tired than usual. If something is bothering you, you can talk to me about it. There's no rush, and I'm here to listen."

════════════════════════════════════════
STRUCTURED CONTEXT FOR CURRENT TURN:
════════════════════════════════════════
${JSON.stringify(contextObj, null, 2)}
`;

    if (!ai || !apiKey) {
      const reply = generateAdaptiveCompanionResponse(
        lastUserMessage,
        mode,
        isTanglishOrTamil,
        consistency,
        safety,
        signals,
        messages
      );
      return res.json({
        reply,
        modelUsed: 'local-companion-engine',
        isFallback: true,
        turn_id,
      });
    }

    // Prepare conversational history for Gemini:
    // Gemini contents MUST alternate between 'user' and 'model', and MUST start with 'user'.
    const rawHistory = messages.slice(-10);
    const cleanedHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

    for (const msg of rawHistory) {
      const role = msg.sender === 'user' ? 'user' : 'model';
      const text = msg.text?.trim() || '';
      if (!text) continue;

      if (cleanedHistory.length === 0) {
        // First message must be 'user'
        if (role === 'user') {
          cleanedHistory.push({ role: 'user', parts: [{ text }] });
        }
      } else {
        const lastItem = cleanedHistory[cleanedHistory.length - 1];
        if (lastItem.role === role) {
          // Merge consecutive turns of same role
          lastItem.parts[0].text += '\n' + text;
        } else {
          cleanedHistory.push({ role, parts: [{ text }] });
        }
      }
    }

    // Ensure the last item in cleanedHistory is the user's latest message
    if (cleanedHistory.length === 0 || cleanedHistory[cleanedHistory.length - 1].role !== 'user') {
      cleanedHistory.push({
        role: 'user',
        parts: [{ text: lastUserMessage || "Hello, I'm here to talk." }],
      });
    }

    let generatedText = '';
    let modelUsed = 'gemini-3.8-flash';

    const chatModelCandidates = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];

    for (const modelCandidate of chatModelCandidates) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: cleanedHistory,
          config: {
            systemInstruction,
            temperature: 0.82,
            maxOutputTokens: 600,
          },
        });
        const reply = response.text ? response.text.trim() : '';
        if (reply) {
          generatedText = reply;
          modelUsed = modelCandidate;
          break;
        }
      } catch (err: any) {
        // Silently cascade to the next model without noisy console error logs
        continue;
      }
    }

    if (!generatedText) {
      generatedText = generateAdaptiveCompanionResponse(
        lastUserMessage,
        mode,
        isTanglishOrTamil,
        consistency,
        safety,
        signals,
        messages
      );
      modelUsed = 'adaptive-companion-engine';
    }

    // Response Guardrail Sanitizer
    const safeText = sanitizeAIResponse(generatedText, isHighRisk);

    return res.json({
      reply: safeText,
      modelUsed,
      isFallback: modelUsed === 'adaptive-companion-engine',
      turn_id,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const { messages = [], mode = 'talk', safety = null, consistency = null, turn_id = 'turn-fallback' } = req.body;
    const lastUserMessage = messages[messages.length - 1]?.text || '';
    const safeFallback = generateAdaptiveCompanionResponse(
      lastUserMessage,
      mode,
      false,
      consistency,
      safety
    );
    return res.json({
      reply: safeFallback,
      modelUsed: 'local-companion-fallback',
      isFallback: true,
      turn_id,
    });
  }
});

// 3. Multimodal Clinical Counselor Handoff Summary
app.post('/api/counselor-summary', async (req: Request, res: Response) => {
  try {
    const { sessionData } = req.body;
    const messages = sessionData?.recentMessages || [];
    const conversationTranscript = messages
      .map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n');

    if (!ai || !apiKey) {
      return res.json({
        summary: `Session Handoff: User reported distress during interaction. Observable signals indicated elevated stress levels and potential cross-modal divergence. Immediate supportive human check-in recommended.`,
        keyObservations: [
          'Acute distress cues detected in conversation.',
          'Signals indicate need for non-judgmental human listening.',
          'Safety protocol activated.',
        ],
      });
    }

    const prompt = `
Create an objective, compassionate clinical counselor handoff briefing for a human crisis counselor.
Do NOT use diagnostic labels (e.g. "patient has depression"). Use observable signals and risk assessment.

Session Data:
- Risk Level: ${sessionData?.userRiskLevel}
- Trend: ${sessionData?.trend}
- Consistency: ${sessionData?.activeConsistency?.status}
- SafeScore: ${sessionData?.safeScore?.score || 'N/A'} (${sessionData?.safeScore?.userLabel || ''})
- Escalation Triggers: ${(sessionData?.safetyTriggers || []).join(', ')}

Recent Transcript:
${conversationTranscript}

Output in JSON format with two keys:
1. "summary": A 2-3 sentence objective overview.
2. "keyObservations": An array of 3 concise bullet points for the counselor.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      summary: parsed.summary || 'User engaged with elevated stress markers.',
      keyObservations: parsed.keyObservations || [
        'Stress indicators present',
        'Vocal or textual tension noted',
      ],
    });
  } catch (err: any) {
    console.error('Error in /api/counselor-summary:', err);
    return res.json({
      summary: 'Session escalated due to elevated distress indicators. Supportive check-in recommended.',
      keyObservations: [
        'Persistent distress markers noted',
        'Human counselor attention requested',
      ],
    });
  }
});

// Mount Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CalmBridge server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
