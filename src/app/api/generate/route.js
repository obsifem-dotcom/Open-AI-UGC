import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, DEFAULT_MUAPI_KEY, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const count = Math.max(1, Math.min(20, Math.round(totalDuration / model.fixedDuration)));
    return new Array(count).fill(model.fixedDuration);
  }

  if (totalDuration <= model.maxDuration) {
    return [clamp(totalDuration, model.minDuration, model.maxDuration)];
  }

  const count = Math.max(2, Math.min(20, Math.ceil(totalDuration / model.maxDuration)));
  const base = Math.floor(totalDuration / count);
  const remainder = totalDuration % count;

  return Array.from({ length: count }, (_, idx) => {
    const raw = idx < remainder ? base + 1 : base;
    return clamp(raw, model.minDuration, model.maxDuration);
  });
}

function splitPromptAcrossSegments(prompt, segmentCount) {
  if (segmentCount <= 1) return [prompt];

  // Check if user separated lines/paragraphs
  const paragraphs = prompt
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length >= segmentCount) {
    const result = [];
    const perSegment = paragraphs.length / segmentCount;
    for (let i = 0; i < segmentCount; i++) {
      const start = Math.floor(i * perSegment);
      const end = i === segmentCount - 1 ? paragraphs.length : Math.floor((i + 1) * perSegment);
      const chunkText = paragraphs.slice(start, Math.max(start + 1, end)).join(" ");
      result.push(chunkText);
    }
    return result;
  }

  // Try splitting by sentences
  const sentences = prompt
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= segmentCount) {
    const result = [];
    const perSegment = sentences.length / segmentCount;
    for (let i = 0; i < segmentCount; i++) {
      const start = Math.floor(i * perSegment);
      const end = i === segmentCount - 1 ? sentences.length : Math.floor((i + 1) * perSegment);
      const chunkText = sentences.slice(start, Math.max(start + 1, end)).join(" ");
      result.push(chunkText);
    }
    return result;
  }

  // Fallback: keep the core visual/script prompt with continuous scene progression
  return Array.from(
    { length: segmentCount },
    (_, i) => `${prompt} (Continuous scene part ${i + 1} of ${segmentCount}, maintaining same character and setting)`
  );
}

function buildSegments({ prompt, settings, scenes, model }) {
  const validScenes = Array.isArray(scenes)
    ? scenes
        .map((s) => ({
          prompt: typeof s?.prompt === "string" ? s.prompt.trim() : "",
          duration: typeof s?.duration === "number" ? s.duration : model.defaultDuration,
        }))
        .filter((s) => s.prompt.length > 0)
    : [];

  if (validScenes.length > 0) {
    const expanded = [];
    for (const scene of validScenes) {
      const durations = splitDurationIntoChunks(scene.duration, model);
      const prompts = splitPromptAcrossSegments(scene.prompt, durations.length);
      durations.forEach((dur, idx) => {
        expanded.push({
          prompt: prompts[idx] || scene.prompt,
          duration: dur,
        });
      });
    }
    return expanded.slice(0, 20);
  }

  const requestedDuration =
    typeof settings.duration === "number" ? settings.duration : model.defaultDuration;
  const durations = splitDurationIntoChunks(requestedDuration, model);
  const prompts = splitPromptAcrossSegments(prompt, durations.length);

  return durations.map((dur, idx) => ({
    prompt: prompts[idx] || prompt,
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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { modelId } = body;
    const rawPrompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const settings = body.settings && typeof body.settings === "object" ? body.settings : {};
    const scenes = Array.isArray(body.scenes) ? body.scenes : [];
    const images = Array.isArray(body.images)
      ? body.images.filter((image) => typeof image === "string" && image.trim())
      : [];

    const isAdmin = Boolean(
      session.user.isAdmin ||
        session.user.role === "admin" ||
        isAdminEmail(session.user.email)
    );

    const headerApiKey = req.headers.get("x-custom-api-key");
    const customApiKey =
      headerApiKey || body.customApiKey || session.user.customApiKey || null;
    const isUsingCustomKey = Boolean(
      (customApiKey && customApiKey.trim().length > 0) || isAdmin
    );

    const apiKey =
      customApiKey && customApiKey.trim().length > 0
        ? customApiKey.trim()
        : process.env.UGC_API_KEY ||
          process.env.MUAPIAPP_API_KEY ||
          DEFAULT_MUAPI_KEY;
    if (!apiKey) {
      return new NextResponse("API Key not configured", { status: 500 });
    }

    const model = MODEL_ENDPOINTS[modelId];
    if (!model) {
      return new NextResponse("Invalid model selected", { status: 400 });
    }

    const segments = buildSegments({
      prompt: rawPrompt,
      settings,
      scenes,
      model,
    });

    if (!segments.length || segments.every((s) => !s.prompt)) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const endpointPath = images.length ? model.imageToVideo : model.textToVideo;
    if (!endpointPath) {
      return new NextResponse("This model requires at least one reference image", { status: 400 });
    }

    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const resolution = settings.resolution || "";
    let requiredCredits = calculateCreditsForDuration(modelId, totalDuration, resolution);

    if (isUsingCustomKey) {
      requiredCredits = 0;
    }

    // Check credits if not using custom key
    if (!isUsingCustomKey) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      if (!user || user.credits < requiredCredits) {
        return NextResponse.json(
          {
            error: `Insufficient credits. This requires ${requiredCredits} credits but you only have ${user?.credits || 0}.`,
          },
          { status: 403 }
        );
      }
    }

    const webhookBase =
      process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin;
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
        payload[model.imageField] = model.imageField === "image_url" ? images[0] : images;
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
        throw new Error(`MUAPI Request Failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const requestId = data.request_id || data.id;
      if (!requestId) {
        throw new Error("MuAPI accepted no request ID for this generation");
      }
      requestIds.push(requestId);
    }

    const isMultiSegment = requestIds.length > 1;
    const combinedPrompt =
      rawPrompt || segments.map((s, idx) => `[Escena ${idx + 1}] ${s.prompt}`).join("\n");

    // Ensure user exists in DB if admin fallback ID was used
    let targetUserId = session.user.id;
    if (isAdmin && targetUserId === "admin-obsifem") {
      const adminEmail = session.user.email || "obsifem@gmail.com";
      const dbAdmin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: { credits: 999999 },
        create: {
          name: "Administrador (UGCora Studio)",
          email: adminEmail,
          credits: 999999,
          customApiKey: DEFAULT_MUAPI_KEY,
        },
      });
      targetUserId = dbAdmin.id;
    }

    // Create entry in DB
    const creation = await prisma.creation.create({
      data: {
        userId: targetUserId,
        type: "video",
        title: combinedPrompt.substring(0, 50) + "...",
        prompt: combinedPrompt,
        requestId: isMultiSegment ? JSON.stringify(requestIds) : requestIds[0],
        url: isMultiSegment ? JSON.stringify(new Array(requestIds.length).fill(null)) : null,
        status: "processing",
        modelId: modelId,
        aspectRatio: settings.aspect_ratio,
        resolution: settings.resolution,
        duration: totalDuration,
        mode: settings.mode,
        inputImages: images && images.length > 0 ? JSON.stringify(images) : null,
      },
    });

    // Deduct required credits if not using custom key
    if (!isUsingCustomKey && requiredCredits > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: requiredCredits } },
      });
    }

    return NextResponse.json({
      success: true,
      creationId: creation.id,
      requestId: creation.requestId,
      segmentsTotal: requestIds.length,
      totalDuration,
    });
  } catch (error) {
    console.error("[GENERATE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
