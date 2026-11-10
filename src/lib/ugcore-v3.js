// UGCore Studio v3.0 — Industrial Audiovisual & Predictive Marketing Engine

export const SOCIAL_PLATFORMS = [
  { id: "tiktok", name: "TikTok", avgRetentionTarget: "78%", pacing: "Fast-cut (1.5s hook)" },
  { id: "reels", name: "Instagram Reels", avgRetentionTarget: "74%", pacing: "Aesthetic + Relatable (2s hook)" },
  { id: "shorts", name: "YouTube Shorts", avgRetentionTarget: "81%", pacing: "Narrative Loop (2s hook)" },
];

export const HOOK_FRAMEWORKS = [
  {
    id: "pattern-interrupt",
    name: "Pattern Interrupt (Choque Visual)",
    retention3s: 84,
    estimatedCtr: "4.8%",
    viralScore: 95,
    badge: "Top Retención 3s",
  },
  {
    id: "contrarian",
    name: "Contrarian / Secreto de Industria",
    retention3s: 81,
    estimatedCtr: "4.5%",
    viralScore: 92,
    badge: "Alto CTR",
  },
  {
    id: "problem-agitate",
    name: "Problema → Solución Directa",
    retention3s: 78,
    estimatedCtr: "4.9%",
    viralScore: 90,
    badge: "Alta Conversión",
  },
  {
    id: "social-proof",
    name: "Prueba Social / Viral TikTok Made Me Buy It",
    retention3s: 79,
    estimatedCtr: "4.6%",
    viralScore: 91,
    badge: "E-Commerce Winner",
  },
];

export const EMOTION_PROFILES = [
  {
    id: "euphoric-viral",
    label: "Eufórico / Viral High-Energy",
    promptDirective:
      "high-energy enthusiastic facial expression, widened expressive eyes on key words, bright authentic smile, dynamic vocal cadence",
  },
  {
    id: "empathetic-trust",
    label: "Empático / Cercano y Honesto",
    promptDirective:
      "warm empathetic expression, soft genuine eye contact, subtle reassuring head nods, natural conversational pacing",
  },
  {
    id: "executive-authority",
    label: "Autoridad Ejecutiva / Experto",
    promptDirective:
      "composed authoritative expression, steady confident gaze into camera lens, precise articulate lip movements, professional posture",
  },
  {
    id: "surprised-reaction",
    label: "Sorpresa / Reacción Impactante",
    promptDirective:
      "genuine amazed reaction, raised eyebrows in the first 2 seconds transitioning into an excited grin, expressive hand gestures",
  },
];

export const MICRO_EXPRESSIONS = [
  {
    id: "eye-contact-lock",
    label: "Mirada fija a lente (Eye-Contact Lock)",
    directive: "locked natural eye contact directly into the camera lens with organic blinking",
  },
  {
    id: "natural-breathing",
    label: "Respiración y micro-pausas orgánicas",
    directive: "subtle organic chest breathing and micro-facial muscle relaxation between sentences",
  },
  {
    id: "hand-gestures",
    label: "Gestos de manos persuasivos",
    directive: "natural conversational hand gestures emphasizing product benefits within frame",
  },
  {
    id: "head-nod-sync",
    label: "Asentimiento sincronizado al hablar",
    directive: "subtle rhythmic head nods synchronized with spoken emphasis points",
  },
];

export const TIMELINE_TRANSITIONS = [
  { id: "cut", label: "Corte Directo (Jump Cut TikTok)", directive: "clean dynamic jump-cut framing" },
  { id: "zoom-in", label: "Punch-In Zoom (Énfasis)", directive: "subtle progressive zoom-in towards subject face" },
  { id: "whip-pan", label: "Transición Dinámica (Whip Pan)", directive: "smooth whip-pan camera motion transition" },
  { id: "cinematic-fade", label: "Fundido Suave (Cinematic)", directive: "smooth cinematic depth-of-field transition" },
];

export function generatePredictiveHooks({
  topic = "",
  benefit = "",
  platform = "tiktok",
  promoType = "product",
}) {
  const cleanTopic =
    topic.trim() ||
    (promoType === "product"
      ? "este producto"
      : promoType === "service"
        ? "este servicio"
        : "este nuevo video");
  const cleanBenefit =
    benefit.trim() || "multiplicar tus resultados en tiempo récord";
  const platInfo =
    SOCIAL_PLATFORMS.find((p) => p.id === platform) || SOCIAL_PLATFORMS[0];

  return [
    {
      id: "hook-1",
      framework: "Pattern Interrupt (Choque Visual)",
      platform: platInfo.name,
      retention3s: 86,
      estimatedCtr: "5.1%",
      viralScore: 96,
      hookText: `¡Deja de hacer scroll! Si todavía no conoces ${cleanTopic}, estás perdiendo la forma más fácil de ${cleanBenefit}.`,
      scenes: [
        {
          label: "Escena 1 (Hook 0-3s)",
          prompt: `Close-up handheld selfie shot, creator leans toward camera with an urgent stop-scrolling gesture. Speaking in Spanish: "¡Deja de hacer scroll! Si todavía no conoces ${cleanTopic}, tienes que ver esto."`,
          duration: 8,
          transition: "zoom-in",
        },
        {
          label: "Escena 2 (Demostración / Valor)",
          prompt: `Medium shot showcasing ${cleanTopic} clearly to camera with dynamic energy. Speaking in Spanish: "Mira cómo funciona: te permite ${cleanBenefit} desde el primer día."`,
          duration: 8,
          transition: "cut",
        },
        {
          label: "Escena 3 (CTA de Alta Conversión)",
          prompt: `Creator smiling confidently and pointing to the bottom of the frame. Speaking in Spanish: "Toca el enlace de abajo ahora mismo antes de que se agote."`,
          duration: 8,
          transition: "cut",
        },
      ],
    },
    {
      id: "hook-2",
      framework: "Secreto / Contrarian Hook",
      platform: platInfo.name,
      retention3s: 83,
      estimatedCtr: "4.7%",
      viralScore: 93,
      hookText: `Nadie te está diciendo la verdad sobre cómo ${cleanBenefit}, hasta que probé ${cleanTopic}.`,
      scenes: [
        {
          label: "Escena 1 (Hook Secreto)",
          prompt: `Creator speaking in an intriguing confidential tone close to the camera. Speaking in Spanish: "Nadie te dice la verdad sobre cómo ${cleanBenefit}, hasta que descubrí ${cleanTopic}."`,
          duration: 8,
          transition: "cut",
        },
        {
          label: "Escena 2 (Prueba en Vivo)",
          prompt: `Creator demonstrating ${cleanTopic} with an impressed facial reaction. Speaking in Spanish: "La diferencia es brutal, cumple exactamente lo que promete."`,
          duration: 8,
          transition: "zoom-in",
        },
        {
          label: "Escena 3 (Llamado a la Acción)",
          prompt: `Creator nodding affirmatively and gesturing toward the bio link. Speaking in Spanish: "Te dejé el acceso directo aquí abajo, pruébalo hoy."`,
          duration: 8,
          transition: "cut",
        },
      ],
    },
    {
      id: "hook-3",
      framework: "Prueba Social / Viral Review",
      platform: platInfo.name,
      retention3s: 80,
      estimatedCtr: "4.9%",
      viralScore: 91,
      hookText: `Por fin puse a prueba ${cleanTopic} después de verlo viral por todas partes… y este fue el resultado.`,
      scenes: [
        {
          label: "Escena 1 (Hook Unboxing / Viral)",
          prompt: `Creator holding ${cleanTopic} up to the lens with excited curiosity. Speaking in Spanish: "Por fin puse a prueba ${cleanTopic} después de verlo viral por todas partes."`,
          duration: 8,
          transition: "cut",
        },
        {
          label: "Escena 2 (Resultado Real)",
          prompt: `Creator showing the result of using ${cleanTopic} with a genuine amazed smile. Speaking in Spanish: "Y sí vale totalmente la pena: logra ${cleanBenefit} sin esfuerzo."`,
          duration: 8,
          transition: "whip-pan",
        },
        {
          label: "Escena 3 (Cierre y Oferta)",
          prompt: `Creator holding ${cleanTopic} and pointing to the screen callout. Speaking in Spanish: "Consíguelo en el link de mi perfil con descuento hoy."`,
          duration: 8,
          transition: "cut",
        },
      ],
    },
  ];
}

export function buildCharacterConsistencyLock({
  ucid = "UCID-SOFIA-01",
  influencer = null,
  wardrobeLock = true,
  lightingLock = true,
  emotionId = "euphoric-viral",
  microExpressionIds = ["eye-contact-lock", "natural-breathing", "hand-gestures"],
}) {
  const emotion =
    EMOTION_PROFILES.find((e) => e.id === emotionId) || EMOTION_PROFILES[0];
  const microDirectives = MICRO_EXPRESSIONS.filter((m) =>
    microExpressionIds.includes(m.id)
  )
    .map((m) => m.directive)
    .join(", ");

  const baseIdentity = influencer
    ? `[Character Lock ${ucid}: ${influencer.name} — ${influencer.visualPrompt}]`
    : `[Character Lock ${ucid}: Consistent primary UGC creator identity across all shots]`;

  const locks = [];
  if (wardrobeLock) {
    locks.push(
      "strictly maintaining identical outfit, hairstyle, and facial features across every scene"
    );
  }
  if (lightingLock) {
    locks.push(
      "consistent 5600K studio key light, identical room background and color grading across cuts"
    );
  }

  return `${baseIdentity} ${locks.join(", ")}. Emotional sync: ${emotion.promptDirective}. Micro-expressions: ${microDirectives}.`;
}


// UGCore Studio v3.5 — Commercial Compliance & Audio Synthesizer Pipeline
export const COMMERCIAL_COMPLIANCE_FRAMEWORK = {
  version: "3.5",
  targetPlatform: "UGCore Studio Commercial Pipeline",
  licenseWhitelist: ["MIT", "Apache-2.0", "BSD-3-Clause"],
  modelAuditStatus: "Strictly Commercial-Safe",
  royaltyFree: true,
  watermarkFree: true,
  modules: [
    {
      id: "commercial-ingestion",
      name: "Commercial-Safe Ingestion Pipeline",
      license: "MIT",
      status: "ACTIVE",
    },
    {
      id: "permissive-render",
      name: "Permissive Open-Source Render Engine",
      license: "Apache-2.0 / MIT",
      status: "ACTIVE",
    },
    {
      id: "text-to-timeline",
      name: "Text-To-Timeline Editor Core",
      license: "MIT",
      status: "ACTIVE",
    },
    {
      id: "commercial-avatar-audio",
      name: "Commercial Avatar & Audio Synthesizer",
      license: "BSD-3-Clause / Commercial-Safe",
      status: "ACTIVE",
    },
  ],
};

export const COMMERCIAL_VOICE_PROFILES = [
  {
    id: "es-latam-commercial",
    label: "🇪🇸 Español Neutro Comercial (LATAM)",
    directive:
      "Clear broadcast-quality Latin American Spanish voiceover with natural commercial cadence and accurate lip-sync",
  },
  {
    id: "es-es-commercial",
    label: "🇪🇸 Español Peninsular (España)",
    directive:
      "Crisp Castilian Spanish commercial voiceover with dynamic brand presenter intonation and lip-sync",
  },
  {
    id: "en-us-commercial",
    label: "🇺🇸 English US (High-Converting Ad Voice)",
    directive:
      "Native American English UGC creator voiceover with high-retention commercial inflection and lip-sync",
  },
  {
    id: "pt-br-commercial",
    label: "🇧🇷 Português Brasil (Comercial)",
    directive:
      "Natural Brazilian Portuguese creator voiceover with warm commercial energy and lip-sync",
  },
  {
    id: "fr-fr-commercial",
    label: "🇫🇷 Français (Comercial & Lifestyle)",
    directive:
      "Natural native French UGC creator voiceover with expressive commercial intonation and lip-sync",
  },
  {
    id: "it-it-commercial",
    label: "🇮🇹 Italiano (Comercial & Moda)",
    directive:
      "Charismatic native Italian UGC creator voiceover with warm expressive cadence and lip-sync",
  },
  {
    id: "de-de-commercial",
    label: "🇩🇪 Deutsch (Comercial & Tech)",
    directive:
      "Clear confident native German UGC creator voiceover with trustworthy commercial delivery and lip-sync",
  },
];
