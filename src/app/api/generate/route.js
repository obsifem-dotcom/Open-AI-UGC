import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, DEFAULT_MUAPI_KEY, isServerMasterKey } from "@/lib/auth";
import { TIMELINE_TRANSITIONS } from "@/lib/ugcore-v3";
import {
  safeGetUserBalance,
  safeGetUserCustomApiKey,
  safeCreateCreation,
  safeDeductCredits,
} from "@/lib/runtime-store";

const MODEL_ENDPOINTS = {
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
        expanded.push({
          prompt: `${prefix}${prompts[idx] || scene.prompt}${transDirective}`.trim(),
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

  return durations.map((dur, idx) => ({
    prompt: `${prefix}${prompts[idx] || prompt}`.trim(),
    duration: dur,
  }));
}

function calculateCreditsForDuration(modelId, duration, resolution) {
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
    if (!session?.user) {
      return NextResponse.json(
        {
          error:
            "Inicia sesión o activa tu Demo Gratis (+150 CR) para generar videos.",
        },
        { status: 401 }
      );
    }
    const activeUser = session.user;

    const body = await req.json();
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

    const isAdmin = Boolean(
      activeUser.isAdmin || activeUser.role === "admin"
    );

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
      rawCustomKey.length > 0 && !isServerMasterKey(rawCustomKey)
    );

    const apiKey = isUsingCustomKey ? rawCustomKey : DEFAULT_MUAPI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key del motor de video no configurada en el servidor." },
        { status: 500 }
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

    const webhookBase =
      process.env.WEBHOOK_URL ||
      process.env.NEXTAUTH_URL ||
      new URL(req.url).origin;
    const webhookUrl = new URL("/api/webhook/muapi", webhookBase).toString();
    const endpoint = new URL(endpointPath, "https://api.muapi.ai");
    if (new URL(webhookUrl).protocol === "https:") {
      endpoint.searchParams.set("webhook", webhookUrl);
    }

    // Submit each segment to MuAPI
    const requestIds = [];
    for (const segment of segments) {
      const payload = {
        ...settings,
        prompt: segment.prompt,
        duration: segment.duration,
      };
      if (images.length) {
        payload[model.imageField] =
          model.imageField === "image_url" ? images[0] : images;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error del motor de video (${response.status}): ${errorText}`
        );
      }

      const data = await response.json();
      const requestId = data.request_id || data.id;
      if (!requestId) {
        throw new Error("El motor de video no devolvió un ID de tarea válido");
      }
      requestIds.push(requestId);
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

    return NextResponse.json({
      success: true,
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
