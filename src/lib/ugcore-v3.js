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
  voiceSpeedId = "natural",
  customVoiceAudioUrl = null,
}) {
  const emotion =
    EMOTION_PROFILES.find((e) => e.id === emotionId) || EMOTION_PROFILES[0];
  const microDirectives = MICRO_EXPRESSIONS.filter((m) =>
    microExpressionIds.includes(m.id)
  )
    .map((m) => m.directive)
    .join(", ");

  const speedObj =
    VOICE_SPEED_OPTIONS.find((s) => s.id === voiceSpeedId) ||
    VOICE_SPEED_OPTIONS[1];

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

  const voiceCloningNote = customVoiceAudioUrl
    ? `Voice Cloning: matched authentic user voice timbre from audio file reference (${customVoiceAudioUrl}), ${speedObj.directive}`
    : `Voice Pacing: ${speedObj.directive}`;

  return `${baseIdentity} ${locks.join(", ")}. Emotional sync: ${emotion.promptDirective}. Micro-expressions: ${microDirectives}. ${voiceCloningNote}.`;
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

export const VOICE_SPEED_OPTIONS = [
  {
    id: "calm",
    label: "🐢 Pausada y Serena (0.85x)",
    shortLabel: "0.85x (Pausada)",
    directive:
      "speaking at a relaxed, calm, articulate pace with clear natural pauses between ideas, perfectly legible diction, never rushed",
  },
  {
    id: "natural",
    label: "🗣️ Natural y Conversacional (1.0x)",
    shortLabel: "1.0x (Natural)",
    directive:
      "speaking at a balanced, natural human conversational pace, friendly and warm with organic breathing and steady rhythm",
  },
  {
    id: "dynamic",
    label: "⚡ Dinámica y Comercial (1.1x)",
    shortLabel: "1.1x (Dinámica)",
    directive:
      "speaking with energetic commercial cadence, upbeat and engaging yet clearly articulated without racing",
  },
];

export const COMMERCIAL_VOICE_PROFILES = [
  {
    id: "es-latam-commercial",
    label: "🎙️ Voz Femenina Cálida & Natural (LATAM)",
    gender: "female",
    directive:
      "Warm charismatic female Latin American Spanish UGC creator voiceover with natural conversational cadence, clear diction, and accurate lip-sync",
  },
  {
    id: "es-latam-female-viral",
    label: "✨ Voz Femenina Amigable & Emprendedora (LATAM)",
    gender: "female",
    directive:
      "Friendly enthusiastic female Latin American Spanish creator voiceover with engaging upbeat tone, balanced speaking pace, and lip-sync",
  },
  {
    id: "es-latam-female-young",
    label: "🌸 Voz Femenina Joven & Fresca (LATAM)",
    gender: "female",
    directive:
      "Fresh authentic young female Latin American Spanish UGC creator voiceover with relatable friendly tone, relaxed pacing, and lip-sync",
  },
  {
    id: "es-latam-male-dynamic",
    label: "🎙️ Voz Masculina Dinámica & Persuasiva (LATAM)",
    gender: "male",
    directive:
      "Confident dynamic male Latin American Spanish creator voiceover with persuasive commercial inflection, natural pauses, and lip-sync",
  },
  {
    id: "es-latam-male-deep",
    label: "🎬 Voz Masculina Profunda & Ejecutiva (LATAM)",
    gender: "male",
    directive:
      "Deep authoritative male Latin American Spanish executive voiceover with trustworthy studio tone, calm measured pace, and lip-sync",
  },
  {
    id: "es-latam-male-young",
    label: "🧢 Voz Masculina Joven & Relatable (LATAM)",
    gender: "male",
    directive:
      "Young approachable male Latin American Spanish creator voiceover with casual conversational style, clear speech, and lip-sync",
  },
  {
    id: "es-es-commercial",
    label: "🇪🇸 Voz Femenina Editorial (España)",
    gender: "female",
    directive:
      "Crisp Castilian Spanish female commercial voiceover with modern brand presenter intonation, steady cadence, and lip-sync",
  },
  {
    id: "es-es-male-pro",
    label: "🇪🇸 Voz Masculina Presentador (España)",
    gender: "male",
    directive:
      "Articulate Castilian Spanish male presenter voiceover with professional broadcast energy, clear pacing, and lip-sync",
  },
  {
    id: "en-us-commercial",
    label: "🇺🇸 Female Creator Voice (English US)",
    gender: "female",
    directive:
      "Native American English female UGC creator voiceover with warm conversational inflection, natural pacing, and lip-sync",
  },
  {
    id: "en-us-male-pro",
    label: "🇺🇸 Male Commercial Voice (English US)",
    gender: "male",
    directive:
      "Native American English male creator voiceover with confident persuasive delivery, clear articulation, and lip-sync",
  },
  {
    id: "custom-voice",
    label: "🎤 Mi Propia Voz (Audio / Nota de Voz subida)",
    gender: "custom",
    directive:
      "Custom user cloned voice matching the timbre, tone, and vocal pitch from user provided audio reference, with synchronized natural lip-sync",
  },
  {
    id: "pt-br-commercial",
    label: "🇧🇷 Voz Feminina Comercial (Português Brasil)",
    gender: "female",
    directive:
      "Natural Brazilian Portuguese female creator voiceover with warm commercial energy and lip-sync",
  },
  {
    id: "pt-br-male-dynamic",
    label: "🇧🇷 Voz Masculina Dinâmica (Português Brasil)",
    gender: "male",
    directive:
      "Energetic Brazilian Portuguese male creator voiceover with engaging commercial cadence and lip-sync",
  },
  {
    id: "fr-fr-commercial",
    label: "🇫🇷 Voix Créateur (Français)",
    gender: "female",
    directive:
      "Natural native French UGC creator voiceover with expressive commercial intonation and lip-sync",
  },
  {
    id: "it-it-commercial",
    label: "🇮🇹 Voce Creatore (Italiano)",
    gender: "male",
    directive:
      "Charismatic native Italian UGC creator voiceover with warm expressive cadence and lip-sync",
  },
  {
    id: "de-de-commercial",
    label: "🇩🇪 Creator-Stimme (Deutsch)",
    gender: "male",
    directive:
      "Clear confident native German UGC creator voiceover with trustworthy commercial delivery and lip-sync",
  },
];

// ============================================================================
// UGCore Studio — Universal YouTube Long-Form Pipeline (4 Chapters × 5 Min)
// Visual Identity: #8B5CF6 (Violet) & #FFFFFF (White) | B-Roll every 25s
// ============================================================================

export const YOUTUBE_LONGFORM_CONFIG = {
  pipelineId: "UGCORE_YOUTUBE_LONGFORM_V1",
  status: "ACTIVE",
  chaptersCount: 4,
  chapterDurationMinutes: 5,
  chapterDurationSeconds: 300,
  totalDurationMinutes: 20,
  totalDurationSeconds: 1200,
  bRollIntervalSeconds: 25,
  bRollInsertionsPerChapter: 12,
  totalBRollInsertions: 48,
  visualIdentity: {
    primaryHex: "#8B5CF6",
    primaryName: "Violeta Eléctrico (#8B5CF6)",
    secondaryHex: "#FFFFFF",
    secondaryName: "Blanco Puro (#FFFFFF)",
    aestheticDirective:
      "Clean high-contrast studio & B-roll visual identity with #8B5CF6 electric violet key accents, subtle violet rim lighting, and crisp #FFFFFF pure white minimalist typography and motion graphics overlays",
  },
};

export function formatTimestampMMSS(totalSeconds) {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export function buildYouTubeLongFormBlueprint({
  topic = "",
  influencerName = "Presentador IA",
  bRollIntervalSeconds = 25,
  primaryHex = "#8B5CF6",
  secondaryHex = "#FFFFFF",
} = {}) {
  const cleanTopic =
    topic.trim() ||
    "Estrategias de Automatización e Inteligencia Artificial para Escalar Negocios Digitales";
  const interval = Math.max(10, Number(bRollIntervalSeconds) || 25);
  const chapterDurSec = 300; // 5 minutes per chapter

  const chapterDefinitions = [
    {
      chapterNumber: 1,
      startSec: 0,
      endSec: 300,
      startTimestamp: "00:00",
      endTimestamp: "05:00",
      title: `Introducción, Hook de Retención y Fundamentos de ${cleanTopic}`,
      objective:
        "Capturar la atención en los primeros 15 segundos, plantear la promesa central del video y desglosar el contexto actual.",
      spokenSummary: `Bienvenidos. Hoy vamos a desglosar a fondo ${cleanTopic}. En estos primeros 5 minutos entenderás por qué el 90% falla al aplicarlo y cuál es la base exacta que necesitas dominar hoy.`,
      bRollTheme: "Gráficos de impacto inicial, estadísticas clave y contexto visual",
    },
    {
      chapterNumber: 2,
      startSec: 300,
      endSec: 600,
      startTimestamp: "05:00",
      endTimestamp: "10:00",
      title: `Arquitectura Paso a Paso y Metodología Práctica de ${cleanTopic}`,
      objective:
        "Demostrar el sistema técnico/práctico en acción con diagramas visuales y ejemplos claros.",
      spokenSummary: `Ahora que tenemos clara la base, entremos en el Capítulo 2: el método paso a paso para implementar ${cleanTopic} con precisión y sin perder tiempo en procesos manuales.`,
      bRollTheme: "Demostración de flujo de trabajo, esquemas modulares y pantallas UI",
    },
    {
      chapterNumber: 3,
      startSec: 600,
      endSec: 900,
      startTimestamp: "10:00",
      endTimestamp: "15:00",
      title: `Casos Reales, Optimización Avanzada y Errores a Evitar en ${cleanTopic}`,
      objective:
        "Contrastar errores comunes frente a mejores prácticas de alto rendimiento, manteniendo la retención media del video.",
      spokenSummary: `En este tercer bloque analizamos resultados reales de ${cleanTopic}, cómo optimizar cada métrica clave y los 3 errores críticos que debes evitar a toda costa.`,
      bRollTheme: "Comparativas Antes vs. Después, métricas de crecimiento y casos de estudio",
    },
    {
      chapterNumber: 4,
      startSec: 900,
      endSec: 1200,
      startTimestamp: "15:00",
      endTimestamp: "20:00",
      title: `Plan de Implementación Inmediata, Futuro y Conclusión sobre ${cleanTopic}`,
      objective:
        "Entregar una hoja de ruta accionable para las próximas 24 horas y cerrar con un llamado a la acción (CTA) de alta conversión.",
      spokenSummary: `Para cerrar en el Capítulo 4, aquí tienes tu hoja de ruta exacta para ejecutar ${cleanTopic} desde hoy mismo. Suscríbete, revisa los recursos en la descripción y déjame tus dudas en los comentarios.`,
      bRollTheme: "Checklist de acción rápida, resumen ejecutivo y pantalla final de conversión",
    },
  ];

  const bRollVisualTemplates = [
    "Minimalist 3D motion graphic chart in #8B5CF6 violet and #FFFFFF pure white",
    "Cinematic macro B-roll shot with #8B5CF6 neon rim light and crisp #FFFFFF clean background",
    "Dynamic kinetic typography callout card (#FFFFFF text on #8B5CF6 badge overlay)",
    "Split-screen visual comparison with #8B5CF6 highlight frame and #FFFFFF UI indicators",
    "High-tech clean dashboard animation accented in #8B5CF6 electric purple and #FFFFFF",
    "Over-the-shoulder workspace B-roll with subtle #8B5CF6 ambient LED and #FFFFFF key light",
  ];

  const chapters = chapterDefinitions.map((ch) => {
    const bRollCues = [];
    for (
      let offset = interval;
      offset <= chapterDurSec;
      offset += interval
    ) {
      const absSec = ch.startSec + offset;
      const cueIndex = bRollCues.length + 1;
      const tpl =
        bRollVisualTemplates[(cueIndex - 1) % bRollVisualTemplates.length];
      bRollCues.push({
        cueNumber: cueIndex,
        relativeSecond: offset,
        absoluteSecond: absSec,
        timestamp: formatTimestampMMSS(absSec),
        durationSeconds: 4,
        palette: `${primaryHex} & ${secondaryHex}`,
        visualDirection: `${tpl} illustrating "${ch.bRollTheme}" for ${cleanTopic}`,
      });
    }

    const scenePrompt = `[YOUTUBE LONG-FORM CHAPTER ${ch.chapterNumber} (${ch.startTimestamp}-${ch.endTimestamp})] Presenter (${influencerName}) speaking to camera in 16:9 YouTube studio with ${primaryHex} violet rim lighting and ${secondaryHex} clean minimalist accents. Auto B-Roll inserted every ${interval}s (${bRollCues.length} cuts in ${primaryHex}/${secondaryHex}). Topic: "${ch.title}". Speaking with natural lip-sync: "${ch.spokenSummary}"`;

    return {
      ...ch,
      durationMinutes: 5,
      durationSeconds: chapterDurSec,
      bRollIntervalSeconds: interval,
      bRollCount: bRollCues.length,
      bRollCues,
      scenePrompt,
    };
  });

  const youtubeChaptersText = chapters
    .map((c) => `${c.startTimestamp} Capítulo ${c.chapterNumber}: ${c.title}`)
    .join("\n");

  const bRollScheduleText = chapters
    .map(
      (c) =>
        `--- CAPÍTULO ${c.chapterNumber} (${c.startTimestamp} - ${c.endTimestamp}) ---\n` +
        c.bRollCues
          .map(
            (cue) =>
              `[${cue.timestamp}] B-Roll #${cue.cueNumber} (${primaryHex} + ${secondaryHex}): ${cue.visualDirection}`
          )
          .join("\n")
    )
    .join("\n\n");

  const seoMetadata = {
    title: `${cleanTopic}: Guía Completa Paso a Paso (Estructura Masterclass)`,
    description: `En este video de formato largo analizamos a fondo ${cleanTopic} dividido en 4 capítulos estratégicos de 5 minutos.\n\n⏱️ MARCAS DE TIEMPO (CAPÍTULOS AUTOMÁTICOS):\n${youtubeChaptersText}\n\n🎨 Identidad Visual: ${primaryHex} (Violeta) & ${secondaryHex} (Blanco) | B-Roll dinámico cada ${interval}s.\n#UGCoreStudio #YouTubeLongForm #IA`,
    tags: [
      cleanTopic,
      `${cleanTopic} guía completa`,
      `${cleanTopic} paso a paso`,
      "UGCore Studio",
      "YouTube Long Form",
    ],
    thumbnailPrompt: `High-CTR 16:9 YouTube thumbnail for "${cleanTopic}", expressive presenter portrait on the right, bold minimalist #FFFFFF white 3-word headline on a vibrant #8B5CF6 electric violet badge, clean dark-to-violet studio background, 8k crisp contrast`,
    youtubeChaptersText,
    bRollScheduleText,
  };

  return {
    config: {
      ...YOUTUBE_LONGFORM_CONFIG,
      bRollIntervalSeconds: interval,
      visualIdentity: {
        ...YOUTUBE_LONGFORM_CONFIG.visualIdentity,
        primaryHex,
        secondaryHex,
      },
    },
    topic: cleanTopic,
    chapters,
    seoMetadata,
  };
}
