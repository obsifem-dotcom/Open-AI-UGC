import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import {
  authOptions,
  DEFAULT_FAL_KEY,
  DEFAULT_MUAPI_KEY,
  DEFAULT_REPLICATE_TOKEN,
  isServerMasterKey,
  isAdminEmail,
} from "@/lib/auth";
import { TIMELINE_TRANSITIONS } from "@/lib/ugcore-v3";
import { formatCreationResponse } from "@/lib/creations";
import {
  safeGetUserBalance,
  safeGetUserCustomApiKey,
  safeCreateCreation,
  safeDeductCredits,
} from "@/lib/runtime-store";

const REPLICATE_MODEL_MAP = {
  "ltx-video": "lightricks/ltx-video",
  "sync-lipsync": "cjwbw/sadtalker",
  "cogvideox-5b": "lucataco/cogvideox-5b",
  "hunyuan-video": "lightricks/ltx-video",
  "animatediff-v3": "lightricks/ltx-video",
  "stable-video-diffusion": "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd449cb99edfe01c21a16664c3e69f183f",
  "fast-svd": "lightricks/ltx-video",
  "seedance-2": "lightricks/ltx-video",
  "grok-video": "lightricks/ltx-video",
  "veo-3-1": "lightricks/ltx-video",
  "happy-horse": "lightricks/ltx-video",
};

const FAL_MODEL_MAP = {
  "sync-lipsync": "fal-ai/sync-lipsync",
  "ltx-video": "fal-ai/ltx-video",
  "cogvideox-5b": "fal-ai/cogvideox-5b",
  "hunyuan-video": "fal-ai/hunyuan-video",
  "animatediff-v3": "fal-ai/ltx-video",
  "stable-video-diffusion": "fal-ai/fast-svd",
  "fast-svd": "fal-ai/fast-svd",
  "seedance-2": "fal-ai/ltx-video",
  "grok-video": "fal-ai/cogvideox-5b",
  "veo-3-1": "fal-ai/hunyuan-video",
  "happy-horse": "fal-ai/ltx-video",
};

const MODEL_ENDPOINTS = {
  "sync-lipsync": {
    imageToVideo: "/api/v1/sync-lipsync-image-to-video",
    textToVideo: "/api/v1/sync-lipsync-text-to-video",
    imageField: "image_url",
    minDuration: 3,
    maxDuration: 15,
    defaultDuration: 5,
    isOpenSource: false,
  },
  "grok-video": {
    imageToVideo: "/api/v1/grok-imagine-image-to-video",
    textToVideo: "/api/v1/grok-imagine-text-to-video",
    imageField: "images_list",
    minDuration: 6,
    maxDuration: 30,
    defaultDuration: 6,
  },
  "veo-3-1": {
    imageToVideo: "/api/v1/veo3.1-image-to-video",
    textToVideo: "/api/v1/veo3.1-text-to-video",
    imageField: "image_url",
    minDuration: 8,
    maxDuration: 8,
    defaultDuration: 8,
    fixedDuration: 8,
  },
  "happy-horse": {
    imageToVideo: "/api/v1/happy-horse-1-image-to-video-720p",
    textToVideo: "/api/v1/happy-horse-1-text-to-video-720p",
    imageField: "images_list",
    minDuration: 3,
    maxDuration: 15,
    defaultDuration: 5,
  },
  "seedance-2": {
    imageToVideo: "/api/v1/seedance-2-image-to-video",
    imageField: "images_list",
    minDuration: 4,
    maxDuration: 15,
    defaultDuration: 5,
  },
  "cogvideox-5b": {
    imageToVideo: "/api/v1/cogvideox-5b-image-to-video",
    textToVideo: "/api/v1/cogvideox-5b-text-to-video",
    imageField: "images_list",
    minDuration: 5,
    maxDuration: 10,
    defaultDuration: 6,
    isOpenSource: true,
  },
  "ltx-video": {
    imageToVideo: "/api/v1/ltx-video-image-to-video",
    textToVideo: "/api/v1/ltx-video-text-to-video",
    imageField: "images_list",
    minDuration: 5,
    maxDuration: 10,
    defaultDuration: 5,
    isOpenSource: true,
  },
  "animatediff-v3": {
    imageToVideo: "/api/v1/animatediff-v3-image-to-video",
    textToVideo: "/api/v1/animatediff-v3-text-to-video",
    imageField: "images_list",
    minDuration: 4,
    maxDuration: 16,
    defaultDuration: 5,
    isOpenSource: true,
  },
  "hunyuan-video": {
    imageToVideo: "/api/v1/hunyuan-video-image-to-video",
    textToVideo: "/api/v1/hunyuan-video-text-to-video",
    imageField: "images_list",
    minDuration: 5,
    maxDuration: 10,
    defaultDuration: 5,
    isOpenSource: true,
  },
  "stable-video-diffusion": {
    imageToVideo: "/api/v1/svd-xt-image-to-video",
    textToVideo: null,
    imageField: "images_list",
    minDuration: 4,
    maxDuration: 5,
    defaultDuration: 4,
    isOpenSource: true,
  },
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function splitDurationIntoChunks(totalDuration, model) {
  if (model.fixedDuration) {
    const count = Math.max(
      1,
      Math.min(20, Math.round(totalDuration / model.fixedDuration))
    );
    return new Array(count).fill(model.fixedDuration);
  }

  if (totalDuration <= model.maxDuration) {
    return [clamp(totalDuration, model.minDuration, model.maxDuration)];
  }

  const count = Math.max(
    2,
    Math.min(20, Math.ceil(totalDuration / model.maxDuration))
  );
  const base = Math.floor(totalDuration / count);
  const remainder = totalDuration % count;

  return Array.from({ length: count }, (_, idx) => {
    const raw = idx < remainder ? base + 1 : base;
    return clamp(raw, model.minDuration, model.maxDuration);
  });
}

function splitPromptAcrossSegments(prompt, segmentCount) {
  if (segmentCount <= 1) return [prompt];

  const paragraphs = prompt
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length >= segmentCount) {
    const result = [];
    const perSegment = paragraphs.length / segmentCount;
    for (let i = 0; i < segmentCount; i++) {
      const start = Math.floor(i * perSegment);
      const end =
        i === segmentCount - 1
          ? paragraphs.length
          : Math.floor((i + 1) * perSegment);
      const chunkText = paragraphs
        .slice(start, Math.max(start + 1, end))
        .join(" ");
      result.push(chunkText);
    }
    return result;
  }

  const sentences = prompt
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= segmentCount) {
    const result = [];
    const perSegment = sentences.length / segmentCount;
    for (let i = 0; i < segmentCount; i++) {
      const start = Math.floor(i * perSegment);
      const end =
        i === segmentCount - 1
          ? sentences.length
          : Math.floor((i + 1) * perSegment);
      const chunkText = sentences
        .slice(start, Math.max(start + 1, end))
        .join(" ");
      result.push(chunkText);
    }
    return result;
  }

  return Array.from(
    { length: segmentCount },
    (_, i) =>
      `${prompt} (Continuous scene part ${i + 1} of ${segmentCount}, maintaining same character and setting)`
  );
}

function buildSegments({
  prompt,
  settings,
  scenes,
  model,
  consistencyDirective = "",
}) {
  const prefix = consistencyDirective ? `${consistencyDirective} ` : "";

  const validScenes = Array.isArray(scenes)
    ? scenes
        .map((s) => ({
          prompt: typeof s?.prompt === "string" ? s.prompt.trim() : "",
          duration:
            typeof s?.duration === "number" ? s.duration : model.defaultDuration,
          transition: typeof s?.transition === "string" ? s.transition : "cut",
        }))
        .filter((s) => s.prompt.length > 0)
    : [];

  if (validScenes.length > 0) {
    const expanded = [];
    for (const scene of validScenes) {
      const transObj = TIMELINE_TRANSITIONS.find(
        (t) => t.id === scene.transition
      );
      const transDirective = transObj
        ? ` [Transition: ${transObj.directive}]`
        : "";
      const durations = splitDurationIntoChunks(scene.duration, model);
      const prompts = splitPromptAcrossSegments(scene.prompt, durations.length);
      durations.forEach((dur, idx) => {
        let p = `${prefix}${prompts[idx] || scene.prompt}${transDirective}`.trim();
        if (
          (p.includes('"') || /speaking/i.test(p) || /voz/i.test(p)) &&
          !/pace|unhurried|pausad|calm|slowly/i.test(p)
        ) {
          p = `${p} [Lip-sync & Voice: speaking slowly at a calm, unhurried, relaxed pace with clear deliberate pauses between sentences]`;
        }
        expanded.push({
          prompt: p,
          duration: dur,
        });
      });
    }
    return expanded.slice(0, 20);
  }

  const requestedDuration =
    typeof settings.duration === "number"
      ? settings.duration
      : model.defaultDuration;
  const durations = splitDurationIntoChunks(requestedDuration, model);
  const prompts = splitPromptAcrossSegments(prompt, durations.length);

  return durations.map((dur, idx) => {
    let p = `${prefix}${prompts[idx] || prompt}`.trim();
    if (
      (p.includes('"') || /speaking/i.test(p) || /voz/i.test(p)) &&
      !/pace|unhurried|pausad|calm|slowly/i.test(p)
    ) {
      p = `${p} [Lip-sync & Voice: speaking slowly at a calm, unhurried, relaxed pace with clear deliberate pauses between sentences]`;
    }
    return {
      prompt: p,
      duration: dur,
    };
  });
}

function extractSpeechDialogue(promptText) {
  if (!promptText || typeof promptText !== "string") {
    return "Hola, te doy la bienvenida. Hoy quiero compartir contigo una recomendación especial para transformar tu bienestar.";
  }

  // 1. Extraer si hay texto entre comillas (el guion hablado explícito)
  const quoteMatches = promptText.match(/"([^"]{4,})"/g);
  if (quoteMatches && quoteMatches.length > 0) {
    const combinedQuotes = quoteMatches
      .map((q) => q.replace(/"/g, "").trim())
      .filter((q) => q.length > 0)
      .join(" ");
    if (combinedQuotes.length >= 5) {
      return combinedQuotes.slice(0, 450);
    }
  }

  // 2. Limpieza de directivas técnicas de cámara, estudio y renderizado
  let cleaned = promptText
    .replace(/\[.*?\]/g, "")
    .replace(/@image\d+[^,.]*[,.]?/gi, "")
    .replace(/Photorealistic Digital Twin[^.]*\./gi, "")
    .replace(/Audio Synthesizer:[^.]*\./gi, "")
    .replace(/Virtual Studio:[^.]*\./gi, "")
    .replace(/Compositing:[^.]*\./gi, "")
    .replace(/Voice pacing:[^.]*\./gi, "")
    .replace(/Voice:[^.]*\./gi, "")
    .replace(/Lip-sync:[^.]*\./gi, "")
    .replace(/Speaking in.*?deliberate pauses:?/gi, "")
    .replace(/The influencer[^.]*\./gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length >= 6) {
    return cleaned.slice(0, 450);
  }

  return "Hola, te doy la bienvenida. Hoy quiero compartir contigo un mensaje especial para inspirarte y conectar con tu paz interior.";
}

function calculateCreditsForDuration(modelId, duration, resolution) {
  if (
    modelId === "sync-lipsync" ||
    modelId === "cogvideox-5b" ||
    modelId === "ltx-video" ||
    modelId === "animatediff-v3" ||
    modelId === "hunyuan-video" ||
    modelId === "stable-video-diffusion"
  ) {
    return 0; // Modelos Gratuitos con clave Fal.ai del usuario
  }
  if (modelId === "grok-video") {
    const rate = resolution === "720p" ? 10 : 5;
    return duration * rate;
  }
  if (modelId === "veo-3-1") {
    let rate = 500;
    if (resolution === "1080p") rate = 650;
    else if (resolution === "4k") rate = 740;
    return duration * rate;
  }
  if (modelId === "happy-horse") {
    return duration * 36;
  }
  if (modelId === "seedance-2") {
    return duration * 50;
  }
  return 10;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const isSandboxRequested = Boolean(
      body.sandbox === true ||
      body.isSandbox === true ||
      body.testMode === true ||
      req.headers.get("x-sandbox-mode") === "true"
    );

    const providedEmail = (
      body.email ||
      body.userEmail ||
      req.headers.get("x-user-email") ||
      ""
    ).toLowerCase().trim();
    const providedAdminKey = (
      body.adminKey ||
      body.adminPassword ||
      req.headers.get("x-admin-key") ||
      ""
    ).trim();

    const candidateEmail = session?.user?.email || providedEmail;
    const isAdmin = Boolean(
      session?.user?.isAdmin ||
      session?.user?.role === "admin" ||
      isAdminEmail(candidateEmail) ||
      (providedAdminKey && isServerMasterKey(providedAdminKey))
    );

    if (!session?.user && !isAdmin && !isSandboxRequested) {
      return NextResponse.json(
        {
          error:
            "Inicia sesión o activa tu Demo Gratis (+300 CR) para generar videos.",
        },
        { status: 401 }
      );
    }

    const activeUser = session?.user || {
      id: isAdmin ? "admin-obsifem" : "guest_" + Math.random().toString(36).slice(2, 9),
      name: isAdmin ? "Administrador UGCore" : "Invitado Demo",
      email: candidateEmail || (isAdmin ? "obsifem@gmail.com" : "guest@ugcorestudio.vercel.app"),
      isAdmin,
      role: isAdmin ? "admin" : "guest",
      credits: isAdmin ? 999999 : 300,
      assignedCredits: isAdmin ? 999999 : 300,
      planId: isAdmin ? "business" : "demo",
      planName: isAdmin ? "Plan Maestro Admin" : "Demo Gratuito",
    };

    const { modelId } = body;
    const rawPrompt =
      typeof body.prompt === "string" ? body.prompt.trim() : "";
    const settings =
      body.settings && typeof body.settings === "object" ? body.settings : {};
    const scenes = Array.isArray(body.scenes) ? body.scenes : [];
    const images = Array.isArray(body.images)
      ? body.images.filter(
          (image) => typeof image === "string" && image.trim()
        )
      : [];

    const headerApiKey = req.headers.get("x-custom-api-key");
    const bodyApiKey =
      typeof body.customApiKey === "string" ? body.customApiKey.trim() : "";
    const storedCustomKey = await safeGetUserCustomApiKey({
      userId: activeUser.id,
      email: activeUser.email,
    });
    const rawCustomKey = (
      headerApiKey ||
      bodyApiKey ||
      storedCustomKey ||
      ""
    ).trim();

    const isUsingCustomKey = Boolean(
      !isAdmin && rawCustomKey.length > 0 && !isServerMasterKey(rawCustomKey)
    );

    const isPayingCustomer = Boolean(
      activeUser.planId &&
        activeUser.planId !== "demo" &&
        activeUser.planId !== "free"
    );

    // Motor Oficial: Replicate (Acelerado con NVIDIA) / Fal.ai
    const replicateToken = (
      (rawCustomKey && (rawCustomKey.startsWith("r8_") || !rawCustomKey.startsWith("fal_")))
        ? rawCustomKey
        : DEFAULT_REPLICATE_TOKEN
    ).trim();

    const falApiKey = (
      (rawCustomKey && rawCustomKey.startsWith("fal_"))
        ? rawCustomKey
        : DEFAULT_FAL_KEY
    ).trim();

    // Preferir Replicate por su velocidad de GPUs NVIDIA y Spend Limits estrictos
    const activeEngine = replicateToken ? "replicate" : (falApiKey ? "fal" : null);

    // Modo Sandbox / Demo: Solo se activa si el usuario lo solicita explícitamente
    const isSandbox = Boolean(
      body.sandbox === true ||
      body.isSandbox === true ||
      body.testMode === true ||
      req.headers.get("x-sandbox-mode") === "true"
    );

    if (!isSandbox && !activeEngine) {
      return NextResponse.json(
        {
          error:
            "No se ha configurado la clave de IA (REPLICATE_API_TOKEN o FAL_KEY). Agrega tu token de Replicate en las Variables de Entorno de Vercel. Si solo deseas probar la interfaz sin consumir saldo, activa el Modo Demostración.",
          needsApiKey: true,
        },
        { status: 400 }
      );
    }

    const model = MODEL_ENDPOINTS[modelId];
    if (!model) {
      return NextResponse.json(
        { error: "Modelo seleccionado no válido" },
        { status: 400 }
      );
    }

    const consistencyDirective =
      typeof body.consistencyDirective === "string"
        ? body.consistencyDirective.trim()
        : "";

    const segments = buildSegments({
      prompt: rawPrompt,
      settings,
      scenes,
      model,
      consistencyDirective,
    });

    if (!segments.length || segments.every((s) => !s.prompt)) {
      return NextResponse.json(
        { error: "El guion o prompt es obligatorio" },
        { status: 400 }
      );
    }

    const endpointPath = images.length ? model.imageToVideo : model.textToVideo;
    if (!endpointPath) {
      return NextResponse.json(
        { error: "Este modelo requiere al menos una imagen de referencia" },
        { status: 400 }
      );
    }

    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const resolution = settings.resolution || "";
    const creditCost = calculateCreditsForDuration(
      modelId,
      totalDuration,
      resolution
    );

    // Check buyer credits safely (never throws prisma.user error)
    const userBalance = await safeGetUserBalance({
      userId: activeUser.id,
      email: activeUser.email,
      isAdmin,
    });

    // MODO PRUEBAS / SANDBOX: Genera videos de prueba inmediatamente con 0 consumo de MuAPI
    if (isSandbox) {
      const sampleLibrary = [
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4",
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      ];

      const isMulti = segments.length > 1;
      const sampleUrls = segments.map(
        (_, idx) => sampleLibrary[idx % sampleLibrary.length]
      );
      const chosenUrl = isMulti ? JSON.stringify(sampleUrls) : sampleUrls[0];
      const sandboxReqIds = segments.map(
        (_, idx) => `sandbox_req_${Date.now()}_${idx + 1}`
      );

      const combinedPrompt =
        rawPrompt ||
        segments.map((s, idx) => `[Escena ${idx + 1}] ${s.prompt}`).join("\n");

      const creation = await safeCreateCreation({
        userId: activeUser.id,
        userEmail: activeUser.email,
        prompt: combinedPrompt,
        requestIds: sandboxReqIds,
        modelId,
        aspectRatio: settings.aspect_ratio || "9:16",
        resolution: settings.resolution || "720p",
        duration: totalDuration,
        mode: settings.mode || "normal",
        images,
        status: "completed",
        url: chosenUrl,
      });

      const formattedCreation = formatCreationResponse(creation);

      return NextResponse.json({
        success: true,
        ...formattedCreation,
        creationId: creation.id,
        status: "completed",
        sandbox: true,
        segmentsTotal: segments.length,
        totalDuration,
        remainingCredits: userBalance?.credits || 999999,
        message:
          "Video generado exitosamente en Modo Pruebas sin consumir créditos de MuAPI.",
      });
    }

    if (!isAdmin && !isUsingCustomKey) {
      const availableCredits =
        typeof userBalance?.credits === "number"
          ? userBalance.credits
          : typeof activeUser.credits === "number"
          ? activeUser.credits
          : 0;

      if (availableCredits < creditCost) {
        return NextResponse.json(
          {
            error: `Créditos insuficientes. Este video requiere ${creditCost} créditos y tienes ${availableCredits} créditos disponibles. Ve a Precios (/pricing) para recargar tu paquete.`,
          },
          { status: 403 }
        );
      }
    }

    // Enviar cada escena al motor activo (Replicate acelerado por NVIDIA o Fal.ai)
    const falEndpoint = FAL_MODEL_MAP[modelId] || "fal-ai/ltx-video";
    const requestIds = [];

    // Fallback de avatar espiritual (Maya Shanti) si no se proporcionó una imagen
    const DEFAULT_SPIRITUAL_AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80";
    const activeImages = images && images.length > 0 ? images : [DEFAULT_SPIRITUAL_AVATAR];

    for (const segment of segments) {
      if (activeEngine === "replicate") {
        const repModel = REPLICATE_MODEL_MAP[modelId] || "lightricks/ltx-video";
        const repInput = {
          prompt: segment.prompt,
          aspect_ratio:
            settings.aspect_ratio === "16:9" ||
            settings.aspect_ratio === "9:16" ||
            settings.aspect_ratio === "1:1"
              ? settings.aspect_ratio
              : "9:16",
        };

        if (activeImages.length) {
          repInput.image = activeImages[0];
          repInput.input_image = activeImages[0];
        }

        const repUrl = repModel.includes(":")
          ? "https://api.replicate.com/v1/predictions"
          : `https://api.replicate.com/v1/models/${repModel}/predictions`;

        const repBody = repModel.includes(":")
          ? { version: repModel.split(":")[1], input: repInput }
          : { input: repInput };

        const repResponse = await fetch(repUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${replicateToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(repBody),
        });

        if (!repResponse.ok) {
          const errText = await repResponse.text();
          let parsedMsg = errText;
          try {
            const errObj = JSON.parse(errText);
            parsedMsg = errObj.detail || errObj.error || errText;
          } catch (_) {}

          if (repResponse.status === 401) {
            throw new Error("Token de Replicate inválido o expirado. Verifica tu REPLICATE_API_TOKEN en Vercel.");
          }
          if (repResponse.status === 402) {
            throw new Error("Saldo agotado o límite de gasto alcanzado en Replicate. Revisa tu panel en replicate.com/billing.");
          }
          throw new Error(`Error en Replicate (${repResponse.status}): ${parsedMsg}`);
        }

        const repData = await repResponse.json();
        const repId = repData.id;
        if (!repId) {
          throw new Error("Replicate no devolvió un ID de predicción válido.");
        }
        requestIds.push(`rep:${repModel}:${repId}`);
        continue;
      }
      // Si el modelo es LipSync, o hay avatar, o se solicitó modo avatar/influencer: generar con audio y labios sincronizados
      const hasAvatarImage = Boolean(activeImages && activeImages.length > 0 && typeof activeImages[0] === "string" && activeImages[0].startsWith("http"));
      const isLipSyncRequested = modelId === "sync-lipsync" || body.creationStyleMode === "avatar" || (hasAvatarImage && body.creationStyleMode !== "cinematic");

      if (hasAvatarImage && isLipSyncRequested) {
        try {
          // 1. Extraer el diálogo limpio en español (sin comandos de renderizado)
          const spokenText = extractSpeechDialogue(segment.prompt);

          // 2. Sintetizar la voz en español HD con Fal.ai (Minimax Speech-02-HD)
          const ttsRes = await fetch("https://fal.run/fal-ai/minimax/speech-02-hd", {
            method: "POST",
            headers: {
              Authorization: `Key ${falApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: spokenText }),
          });

          if (!ttsRes.ok) {
            const ttsErr = await ttsRes.text();
            throw new Error(`Error en síntesis de voz Fal.ai (${ttsRes.status}): ${ttsErr}`);
          }

          const ttsData = await ttsRes.json();
          const audioUrl = ttsData?.audio?.url;
          if (!audioUrl) {
            throw new Error("Fal.ai no devolvió la URL del audio sintetizado.");
          }

          // 3. Animar los labios del avatar con definición y sonido sincronizado (Sync Labs v3)
          const lipsyncRes = await fetch("https://queue.fal.run/fal-ai/sync-lipsync/v3/image-to-video", {
            method: "POST",
            headers: {
              Authorization: `Key ${falApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image_url: activeImages[0],
              audio_url: audioUrl,
            }),
          });

          if (!lipsyncRes.ok) {
            const lipErr = await lipsyncRes.text();
            throw new Error(`Error en sincronización labial Fal.ai (${lipsyncRes.status}): ${lipErr}`);
          }

          const lipsyncData = await lipsyncRes.json();
          const reqId = lipsyncData.request_id || lipsyncData.id;
          if (reqId) {
            requestIds.push(`fal:fal-ai/sync-lipsync:${reqId}`);
            continue;
          }
        } catch (lipsyncErr) {
          console.error("[LIPSYNC_ERROR]", lipsyncErr?.message || lipsyncErr);
          if (modelId === "sync-lipsync") {
            throw lipsyncErr;
          }
        }
      }

      // Modo Cinemático / B-Roll estándar (LTX-Video / CogVideoX / Hunyuan)
      const falQueueUrl = `https://queue.fal.run/${falEndpoint}`;
      const falPayload = {
        prompt: segment.prompt,
        aspect_ratio:
          settings.aspect_ratio === "16:9" ||
          settings.aspect_ratio === "9:16" ||
          settings.aspect_ratio === "1:1"
            ? settings.aspect_ratio
            : "9:16",
      };

      if (activeImages.length) {
        falPayload.image_url = activeImages[0];
      }

      const falResponse = await fetch(falQueueUrl, {
        method: "POST",
        headers: {
          Authorization: `Key ${falApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(falPayload),
      });

      if (!falResponse.ok) {
        const errorText = await falResponse.text();
        throw new Error(
          `Error de Fal.ai (${falResponse.status}): ${errorText}`
        );
      }

      const falData = await falResponse.json();
      const falReqId = falData.request_id || falData.id;
      if (!falReqId) {
        throw new Error("Fal.ai no devolvió un ID de tarea válido");
      }
      requestIds.push(`fal:${falEndpoint}:${falReqId}`);
    }

    const combinedPrompt =
      rawPrompt ||
      segments.map((s, idx) => `[Escena ${idx + 1}] ${s.prompt}`).join("\n");

    // Safe creation storage (works with Prisma DB AND stateless fallback if DB is unreachable)
    const creation = await safeCreateCreation({
      userId: activeUser.id,
      userEmail: activeUser.email,
      prompt: combinedPrompt,
      requestIds,
      modelId,
      aspectRatio: settings.aspect_ratio,
      resolution: settings.resolution,
      duration: totalDuration,
      mode: settings.mode,
      images,
    });

    // Deduct buyer credits safely
    if (!isAdmin && !isUsingCustomKey && creditCost > 0) {
      await safeDeductCredits({
        userId: activeUser.id,
        email: activeUser.email,
        amount: creditCost,
      });
    }

    const updatedBalance = await safeGetUserBalance({
      userId: activeUser.id,
      email: activeUser.email,
      isAdmin,
    });

    const formattedCreation = formatCreationResponse(creation);

    return NextResponse.json({
      success: true,
      ...formattedCreation,
      creationId: creation.id,
      requestId: creation.requestId,
      segmentsTotal: requestIds.length,
      totalDuration,
      creditCost,
      remainingCredits: updatedBalance.credits,
    });
  } catch (error) {
    console.error("[GENERATE_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Error interno al generar el video" },
      { status: 500 }
    );
  }
}
