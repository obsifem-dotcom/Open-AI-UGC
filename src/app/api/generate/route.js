import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MODEL_ENDPOINTS = {
  "grok-video": {
    imageToVideo: "/api/v1/grok-imagine-image-to-video",
    textToVideo: "/api/v1/grok-imagine-text-to-video",
    imageField: "images_list",
  },
  "veo-3-1": {
    imageToVideo: "/api/v1/veo3.1-image-to-video",
    textToVideo: "/api/v1/veo3.1-text-to-video",
    imageField: "image_url",
  },
  "happy-horse": {
    imageToVideo: "/api/v1/happy-horse-1-image-to-video-720p",
    textToVideo: "/api/v1/happy-horse-1-text-to-video-720p",
    imageField: "images_list",
  },
  "seedance-2": {
    imageToVideo: "/api/v1/seedance-2-image-to-video",
    imageField: "images_list",
  },
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { modelId } = body;
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const settings = body.settings && typeof body.settings === "object" ? body.settings : {};
    const images = Array.isArray(body.images)
      ? body.images.filter((image) => typeof image === "string" && image.trim())
      : [];

    const headerApiKey = req.headers.get("x-custom-api-key");
    const customApiKey = headerApiKey || body.customApiKey || session.user.customApiKey || null;
    const isUsingCustomKey = Boolean(customApiKey && customApiKey.trim().length > 0);

    const apiKey = isUsingCustomKey
      ? customApiKey.trim()
      : process.env.UGC_API_KEY || process.env.MUAPIAPP_API_KEY;
    if (!apiKey) {
      return new NextResponse("API Key not configured", { status: 500 });
    }

    const model = MODEL_ENDPOINTS[modelId];
    if (!model) {
      return new NextResponse("Invalid model selected", { status: 400 });
    }
    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const endpointPath = images.length ? model.imageToVideo : model.textToVideo;
    if (!endpointPath) {
      return new NextResponse("This model requires at least one reference image", { status: 400 });
    }

    // Calculate required credits
    let requiredCredits = 10;
    const duration = typeof settings.duration === "number" ? settings.duration : 5;
    const resolution = settings.resolution || "";

    if (modelId === "grok-video") {
      const grokDuration = typeof settings.duration === "number" ? settings.duration : 6;
      const rate = resolution === "720p" ? 10 : 5;
      requiredCredits = grokDuration * rate;
    } else if (modelId === "veo-3-1") {
      const veoDuration = typeof settings.duration === "number" ? settings.duration : 8;
      let rate = 500;
      if (resolution === "1080p") rate = 650;
      else if (resolution === "4k") rate = 740;
      requiredCredits = veoDuration * rate;
    } else if (modelId === "happy-horse") {
      requiredCredits = duration * 36;
    } else if (modelId === "seedance-2") {
      requiredCredits = duration * 50;
    }

    if (isUsingCustomKey) {
      requiredCredits = 0;
    }

    // Check credits if not using custom key
    if (!isUsingCustomKey) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      });

      if (!user || user.credits < requiredCredits) {
        return NextResponse.json({ error: `Insufficient credits. This requires ${requiredCredits} credits but you only have ${user?.credits || 0}.` }, { status: 403 });
      }
    }

    const webhookBase = process.env.WEBHOOK_URL || process.env.NEXTAUTH_URL || new URL(req.url).origin;
    const webhookUrl = new URL("/api/webhook/muapi", webhookBase).toString();
    const endpoint = new URL(endpointPath, "https://api.muapi.ai");
    if (new URL(webhookUrl).protocol === "https:") {
      endpoint.searchParams.set("webhook", webhookUrl);
    }

    const payload = {
      prompt,
      ...settings,
    };
    if (images.length) {
      payload[model.imageField] = model.imageField === "image_url" ? images[0] : images;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify(payload)
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

    // Create entry in DB
    const creation = await prisma.creation.create({
      data: {
        userId: session.user.id,
        type: "video",
        title: prompt.substring(0, 50) + "...",
        prompt: prompt,
        requestId,
        status: "processing",
        modelId: modelId,
        aspectRatio: settings.aspect_ratio,
        resolution: settings.resolution,
        duration: settings.duration,
        mode: settings.mode,
        inputImages: images && images.length > 0 ? JSON.stringify(images) : null
      }
    });

    // Deduct required credits if not using custom key
    if (!isUsingCustomKey && requiredCredits > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: requiredCredits } }
      });
    }

    return NextResponse.json({ 
      success: true, 
      creationId: creation.id,
      requestId: creation.requestId 
    });

  } catch (error) {
    console.error("[GENERATE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
