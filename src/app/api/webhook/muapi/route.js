import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/creations";
import { runtimeStore } from "@/lib/runtime-store";

function extractVideoUrl(data) {
  if (!data) return null;
  if (Array.isArray(data.outputs) && data.outputs.length > 0 && typeof data.outputs[0] === "string") {
    return data.outputs[0];
  }
  if (Array.isArray(data.output) && data.output.length > 0 && typeof data.output[0] === "string") {
    return data.output[0];
  }
  if (typeof data.output === "string" && data.output.startsWith("http")) {
    return data.output;
  }
  if (typeof data.url === "string" && data.url.startsWith("http")) {
    return data.url;
  }
  if (typeof data.video_url === "string" && data.video_url.startsWith("http")) {
    return data.video_url;
  }
  if (data.result) {
    if (typeof data.result === "string" && data.result.startsWith("http")) return data.result;
    if (typeof data.result.url === "string") return data.result.url;
    if (Array.isArray(data.result.outputs) && data.result.outputs[0]) return data.result.outputs[0];
  }
  return null;
}

async function updateCreationEverywhere(creation, data) {
  const updated = { ...creation, ...data };
  runtimeStore.creationsById.set(creation.id, updated);

  if (
    prisma?.creation &&
    creation.id &&
    !String(creation.id).startsWith("mu_") &&
    !String(creation.id).startsWith("mum_")
  ) {
    try {
      await prisma.creation.update({
        where: { id: creation.id },
        data,
      });
    } catch (err) {
      console.warn("[MUAPI_WEBHOOK_DB_FALLBACK]", err?.message || err);
    }
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("[MUAPI_WEBHOOK_RECEIVED]", data);

    const requestId = data.id || data.request_id;

    if (!requestId) {
      console.error("[MUAPI_WEBHOOK_ERROR] Missing request id in payload", data);
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    let creation = null;
    if (prisma?.creation) {
      try {
        creation = await prisma.creation.findUnique({
          where: { requestId },
        });
        if (!creation) {
          creation = await prisma.creation.findFirst({
            where: { requestId: { contains: requestId } },
          });
        }
      } catch (err) {
        console.warn("[MUAPI_WEBHOOK_FIND_FALLBACK]", err?.message || err);
      }
    }

    if (!creation) {
      for (const item of runtimeStore.creationsById.values()) {
        if (
          item?.requestId === requestId ||
          (typeof item?.requestId === "string" && item.requestId.includes(requestId))
        ) {
          creation = item;
          break;
        }
      }
    }

    if (!creation) {
      console.warn(`[MUAPI_WEBHOOK] Creation with requestId ${requestId} not found.`);
      return NextResponse.json({ error: "Creation not found" }, { status: 404 });
    }

    const multiRequestIds = parseJsonArray(creation.requestId);

    if (multiRequestIds && multiRequestIds.length > 0) {
      const segIndex = multiRequestIds.indexOf(requestId);
      if (segIndex === -1) {
        return NextResponse.json({ error: "Segment not found" }, { status: 404 });
      }

      const rawUrls =
        parseJsonArray(creation.url) || new Array(multiRequestIds.length).fill(null);
      const updatedUrls = [...rawUrls];

      if (data.status === "completed" || data.outputs || data.output || data.url) {
        const segUrl = extractVideoUrl(data);
        if (segUrl) {
          updatedUrls[segIndex] = segUrl;
        }
      }

      const allCompleted = updatedUrls.every(
        (u) => typeof u === "string" && u.length > 0
      );

      if (allCompleted) {
        await updateCreationEverywhere(creation, {
          status: "completed",
          url: JSON.stringify(updatedUrls),
        });
      } else if (data.status === "failed" && !updatedUrls.some(Boolean)) {
        await updateCreationEverywhere(creation, {
          status: "failed",
          error: data.error || "Generation failed",
        });
      } else {
        await updateCreationEverywhere(creation, {
          url: JSON.stringify(updatedUrls),
        });
      }

      return NextResponse.json({ success: true });
    }

    if (data.status === "failed" || (data.error && data.error !== "")) {
      await updateCreationEverywhere(creation, {
        status: "failed",
        error: data.error || "Generation failed",
      });
    } else if (data.status === "completed" || extractVideoUrl(data)) {
      const videoUrl = extractVideoUrl(data);

      await updateCreationEverywhere(creation, {
        status: videoUrl ? "completed" : (data.status || "completed"),
        url: videoUrl || creation.url,
      });
    } else {
      await updateCreationEverywhere(creation, {
        status: data.status || "processing",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MUAPI_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
