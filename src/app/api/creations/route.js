import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail, DEFAULT_MUAPI_KEY } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJsonArray, formatCreationResponse } from "@/lib/creations";
import {
  runtimeStore,
  STUDIO_SHOWCASE_CREATIONS,
} from "@/lib/runtime-store";

async function refreshPendingCreationIfNeeded(creation, apiKey) {
  const activeStatuses = ["processing", "pending", "starting", "queued"];
  if (
    !creation ||
    !activeStatuses.includes(creation.status) ||
    !creation.requestId ||
    String(creation.requestId).startsWith("showcase_")
  ) {
    return creation;
  }

  const multiRequestIds = parseJsonArray(creation.requestId);
  if (multiRequestIds && multiRequestIds.length > 0) {
    const rawUrls =
      parseJsonArray(creation.url) ||
      new Array(multiRequestIds.length).fill(null);
    const updatedUrls = [...rawUrls];
    let hasChanges = false;
    let failedError = null;

    await Promise.all(
      multiRequestIds.map(async (reqId, idx) => {
        if (updatedUrls[idx]) return;
        try {
          const checkRes = await fetch(
            `https://api.muapi.ai/api/v1/predictions/${reqId}/result`,
            {
              method: "GET",
              headers: { "x-api-key": apiKey },
            }
          );
          if (!checkRes.ok) return;
          const checkData = await checkRes.json();
          const upstreamStatus = checkData.status || "processing";
          if (upstreamStatus === "failed") {
            failedError =
              checkData.error || `Scene ${idx + 1} generation failed`;
          } else if (
            upstreamStatus === "completed" ||
            (checkData.outputs && checkData.outputs.length > 0)
          ) {
            const outputs = checkData.outputs || [];
            if (outputs[0]) {
              updatedUrls[idx] = outputs[0];
              hasChanges = true;
            }
          }
        } catch {
          // ignore transient poll error
        }
      })
    );

    const allCompleted = updatedUrls.every(
      (u) => typeof u === "string" && u.length > 0
    );
    if (allCompleted) {
      const updated = {
        ...creation,
        status: "completed",
        url: JSON.stringify(updatedUrls),
      };
      runtimeStore.creationsById.set(creation.id, updated);
      return updated;
    }
    if (failedError && !updatedUrls.some(Boolean)) {
      const updated = { ...creation, status: "failed", error: failedError };
      runtimeStore.creationsById.set(creation.id, updated);
      return updated;
    }
    if (hasChanges) {
      const updated = { ...creation, url: JSON.stringify(updatedUrls) };
      runtimeStore.creationsById.set(creation.id, updated);
      return updated;
    }
    return creation;
  }

  try {
    const checkRes = await fetch(
      `https://api.muapi.ai/api/v1/predictions/${creation.requestId}/result`,
      {
        method: "GET",
        headers: { "x-api-key": apiKey },
      }
    );
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      const upstreamStatus = checkData.status || "processing";
      if (upstreamStatus === "failed") {
        const updated = {
          ...creation,
          status: "failed",
          error: checkData.error || "Generation failed",
        };
        runtimeStore.creationsById.set(creation.id, updated);
        return updated;
      }
      if (
        upstreamStatus === "completed" ||
        (checkData.outputs && checkData.outputs.length > 0)
      ) {
        const outputs = checkData.outputs || [];
        const videoUrl = outputs.length > 0 ? outputs[0] : null;
        const updated = {
          ...creation,
          status: "completed",
          url: videoUrl,
        };
        runtimeStore.creationsById.set(creation.id, updated);
        return updated;
      }
    }
  } catch {
    // ignore transient poll error
  }

  return creation;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const activeUser = session?.user;

    const isAdmin = Boolean(
      !activeUser ||
        activeUser.isAdmin ||
        activeUser.role === "admin" ||
        isAdminEmail(activeUser.email)
    );

    const byId = new Map();

    // Ensure studio showcase creations are always available
    for (const sc of STUDIO_SHOWCASE_CREATIONS) {
      byId.set(sc.id, sc);
    }

    for (const [id, item] of runtimeStore.creationsById.entries()) {
      if (isAdmin || item.isShowcase || item.userId === activeUser?.id) {
        byId.set(id, item);
      }
    }

    if (prisma?.creation) {
      try {
        const dbCreations = await prisma.creation.findMany({
          where: isAdmin ? {} : { userId: activeUser.id },
          orderBy: { createdAt: "desc" },
          take: 100,
        });
        for (const c of dbCreations) {
          byId.set(c.id, c);
        }
      } catch (err) {
        console.warn("[SAFE_CREATIONS_LIST_FALLBACK]", err?.message || err);
      }
    }

    const apiKey =
      activeUser?.customApiKey ||
      process.env.UGC_API_KEY ||
      process.env.MUAPIAPP_API_KEY ||
      DEFAULT_MUAPI_KEY;

    const rawList = Array.from(byId.values());
    const refreshedList = await Promise.all(
      rawList.map((item) => refreshPendingCreationIfNeeded(item, apiKey))
    );

    const list = refreshedList.sort((a, b) => {
      // User creations first, then showcase creations sorted by date
      const aShowcase = Boolean(a.isShowcase);
      const bShowcase = Boolean(b.isShowcase);
      if (aShowcase !== bShowcase) return aShowcase ? 1 : -1;
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    return NextResponse.json(list.map(formatCreationResponse));
  } catch (error) {
    console.error("[CREATIONS_GET_ERROR]", error);
    return NextResponse.json(
      STUDIO_SHOWCASE_CREATIONS.map(formatCreationResponse),
      { status: 200 }
    );
  }
}
