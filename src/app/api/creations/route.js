import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, DEFAULT_MUAPI_KEY, isServerMasterKey, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJsonArray, formatCreationResponse } from "@/lib/creations";
import {
  runtimeStore,
  STUDIO_SHOWCASE_CREATIONS,
  safeGetUserCustomApiKey,
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
    const activeUser = session?.user || null;

    const isAdmin = Boolean(
      activeUser && (
        activeUser.isAdmin ||
        activeUser.role === "admin" ||
        isAdminEmail(activeUser.email)
      )
    );

    const byId = new Map();

    // Ensure studio showcase creations are always available
    for (const sc of STUDIO_SHOWCASE_CREATIONS) {
      byId.set(sc.id, sc);
    }

    for (const [id, item] of runtimeStore.creationsById.entries()) {
      if (item.isShowcase || isAdmin) {
        byId.set(id, item);
        continue;
      }
      const isOwner =
        (activeUser?.id && item.userId === activeUser.id) ||
        (activeUser?.email &&
          item.userEmail &&
          item.userEmail.toLowerCase() === activeUser.email.toLowerCase());

      if (isOwner || item.status === "completed") {
        byId.set(id, item);
      }
    }

    if (prisma?.creation) {
      try {
        const dbCreations = await prisma.creation.findMany({
          where: isAdmin
            ? {}
            : activeUser
            ? {
                OR: [
                  { userId: activeUser.id },
                  ...(activeUser.email
                    ? [{ user: { email: activeUser.email.toLowerCase().trim() } }]
                    : []),
                  { status: "completed" },
                ],
              }
            : { status: "completed" },
          include: { user: true },
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

    const storedCustomKey = activeUser
      ? await safeGetUserCustomApiKey({
          userId: activeUser.id,
          email: activeUser.email,
        })
      : null;
    const customKey =
      storedCustomKey && !isServerMasterKey(storedCustomKey) && !isAdmin
        ? storedCustomKey
        : null;
    const apiKey = customKey || DEFAULT_MUAPI_KEY;

    // Robust deduplication by Normalized Prompt, URL, canonical requestId, and clean ID
    function getCleanKey(item) {
      if (!item) return null;

      // 1. User creations: deduplicate by normalized prompt text
      if (!item.isShowcase && typeof item.prompt === "string") {
        const cleanPrompt = item.prompt
          .replace(/\[.*?\]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .slice(0, 120);
        if (cleanPrompt.length >= 10) {
          return `prompt:${cleanPrompt}`;
        }
      }

      // 2. Playable URL (excluding generic demo placeholders)
      const u = item.url;
      if (typeof u === "string") {
        const trimmed = u.trim();
        if (trimmed.startsWith("http") && !trimmed.includes("sample/ForBigger")) {
          return `url:${trimmed.toLowerCase()}`;
        }
        if (trimmed.startsWith("[")) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && parsed[0] && typeof parsed[0] === "string" && parsed[0].startsWith("http")) {
              return `url:${parsed[0].trim().toLowerCase()}`;
            }
          } catch {}
        }
      }
      if (Array.isArray(item.urls) && item.urls[0] && typeof item.urls[0] === "string" && item.urls[0].startsWith("http")) {
        return `url:${item.urls[0].trim().toLowerCase()}`;
      }

      // 3. Request ID
      if (item.requestId) {
        const reqStr = String(item.requestId).trim();
        if (reqStr.startsWith("[")) {
          try {
            const parsed = JSON.parse(reqStr);
            if (Array.isArray(parsed) && parsed[0]) {
              const clean = String(parsed[0]).replace(/["'\[\]\\]/g, "").trim();
              if (clean.length > 0) return `req:${clean}`;
            }
          } catch {}
        }
        const cleanReq = reqStr.replace(/["'\[\]\\]/g, "").trim();
        if (cleanReq.length > 0 && !cleanReq.startsWith("sandbox_req_")) {
          return `req:${cleanReq}`;
        }
      }

      if (item.id) {
        return `id:${String(item.id).replace(/^mu_|^stateless_/, "")}`;
      }
      return null;
    }

    const byKey = new Map();
    for (const item of byId.values()) {
      if (!item) continue;
      const key = getCleanKey(item) || item.id;
      if (!byKey.has(key)) {
        byKey.set(key, item);
      } else {
        const existing = byKey.get(key);
        const preferItem =
          (item.url && !existing.url) ||
          (item.status === "completed" && existing.status !== "completed") ||
          (!String(item.id).startsWith("mu_") && String(existing.id).startsWith("mu_"));
        byKey.set(key, preferItem ? { ...existing, ...item } : { ...item, ...existing });
      }
    }

    const rawList = Array.from(byKey.values());
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

export async function DELETE(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {}

    const targetId = body.id;
    const targetReqId = body.requestId;
    const targetUrl = body.url;
    const targetPrompt = body.prompt;

    if (targetId) runtimeStore.creationsById.delete(targetId);
    for (const [memKey, memVal] of runtimeStore.creationsById.entries()) {
      if (
        (targetId && (memKey === targetId || memVal?.id === targetId)) ||
        (targetReqId && (memVal?.requestId === targetReqId || String(memVal?.requestId).includes(String(targetReqId)))) ||
        (targetUrl && memVal?.url === targetUrl)
      ) {
        runtimeStore.creationsById.delete(memKey);
      }
    }

    if (prisma?.creation) {
      try {
        const orConditions = [];
        if (targetId && !targetId.startsWith("mu_") && !targetId.startsWith("stateless_")) {
          orConditions.push({ id: targetId });
        }
        if (targetReqId) {
          orConditions.push({ requestId: String(targetReqId) });
          orConditions.push({ requestId: { contains: String(targetReqId) } });
        }
        if (targetUrl && typeof targetUrl === "string" && targetUrl.startsWith("http")) {
          orConditions.push({ url: targetUrl });
          orConditions.push({ url: { contains: targetUrl } });
        }
        if (targetPrompt && typeof targetPrompt === "string" && targetPrompt.length >= 10) {
          orConditions.push({ prompt: targetPrompt });
        }

        if (orConditions.length > 0) {
          await prisma.creation.deleteMany({
            where: { OR: orConditions },
          });
        }
      } catch (err) {
        console.warn("[SAFE_CREATIONS_DELETE_FALLBACK]", err?.message || err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Video eliminado correctamente.",
      id: targetId,
    });
  } catch (error) {
    console.error("[CREATIONS_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo eliminar el video" },
      { status: 500 }
    );
  }
}
