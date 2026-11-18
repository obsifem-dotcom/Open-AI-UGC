import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, DEFAULT_MUAPI_KEY, isServerMasterKey } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJsonArray, formatCreationResponse } from "@/lib/creations";
import {
  runtimeStore,
  STUDIO_SHOWCASE_CREATIONS,
  decodeStatelessCreationId,
  safeGetUserCustomApiKey,
} from "@/lib/runtime-store";

function extractVideoUrl(checkData) {
  if (!checkData) return null;
  if (Array.isArray(checkData.outputs) && checkData.outputs.length > 0 && typeof checkData.outputs[0] === "string") {
    return checkData.outputs[0];
  }
  if (Array.isArray(checkData.output) && checkData.output.length > 0 && typeof checkData.output[0] === "string") {
    return checkData.output[0];
  }
  if (typeof checkData.output === "string" && checkData.output.startsWith("http")) {
    return checkData.output;
  }
  if (typeof checkData.url === "string" && checkData.url.startsWith("http")) {
    return checkData.url;
  }
  if (typeof checkData.video_url === "string" && checkData.video_url.startsWith("http")) {
    return checkData.video_url;
  }
  if (checkData.result) {
    if (typeof checkData.result === "string" && checkData.result.startsWith("http")) return checkData.result;
    if (typeof checkData.result.url === "string") return checkData.result.url;
    if (Array.isArray(checkData.result.outputs) && checkData.result.outputs[0]) return checkData.result.outputs[0];
  }
  return null;
}

async function safeUpdateCreationRecord(id, isDbRecord, data) {
  const existingMem = runtimeStore.creationsById.get(id);
  const updatedMem = existingMem ? { ...existingMem, ...data } : { id, ...data };
  runtimeStore.creationsById.set(id, updatedMem);

  if (isDbRecord && prisma?.creation) {
    try {
      const updatedDb = await prisma.creation.update({
        where: { id },
        data,
      });
      runtimeStore.creationsById.set(id, updatedDb);
      return updatedDb;
    } catch (err) {
      console.warn("[SAFE_CREATION_UPDATE_FALLBACK]", err?.message || err);
    }
  }
  return updatedMem;
}

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    let creation = null;
    let isDbRecord = false;

    // 1. Try Prisma DB safely
    if (prisma?.creation && !id.startsWith("mu_") && !id.startsWith("mum_")) {
      try {
        creation = await prisma.creation.findUnique({
          where: { id },
        });
        if (creation) {
          isDbRecord = true;
        }
      } catch (err) {
        console.warn("[SAFE_CREATION_FIND_FALLBACK]", err?.message || err);
      }
    }

    // 2. Fallback to runtime in-memory store
    if (!creation && runtimeStore.creationsById.has(id)) {
      creation = runtimeStore.creationsById.get(id);
    }

    // 3. Stateless decode fallback (works across any Vercel serverless container!)
    if (!creation) {
      const decoded = decodeStatelessCreationId(id);
      if (decoded) {
        creation = {
          id,
          type: "video",
          title: "Video UGCore Studio",
          prompt: "Video UGCore Studio",
          requestId: decoded.isMulti
            ? JSON.stringify(decoded.requestIds)
            : decoded.requestIds[0],
          url: decoded.isMulti
            ? JSON.stringify(new Array(decoded.requestIds.length).fill(null))
            : null,
          status: "processing",
          createdAt: new Date().toISOString(),
        };
        runtimeStore.creationsById.set(id, creation);
      }
    }

    if (!creation) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const isAdmin = Boolean(
      session?.user && (session.user.isAdmin || session.user.role === "admin")
    );
    if (
      isDbRecord &&
      !creation.isShowcase &&
      (!session?.user || (!isAdmin && creation.userId !== session.user.id))
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const activeStatuses = ["processing", "pending", "starting", "queued"];
    const isSandboxRequest =
      typeof creation.requestId === "string" &&
      (creation.requestId.includes("sandbox_") ||
        creation.requestId.includes("showcase_") ||
        creation.requestId.includes("test_"));

    if (
      activeStatuses.includes(creation.status) &&
      creation.requestId &&
      !isSandboxRequest
    ) {
      const createdAtTime = new Date(creation.createdAt || Date.now()).getTime();
      const elapsedMinutes = (Date.now() - createdAtTime) / (60 * 1000);
      if (elapsedMinutes > 8) {
        creation = await safeUpdateCreationRecord(id, isDbRecord, {
          status: "failed",
          error: "Tiempo de espera agotado en el motor de video. Por favor reintenta la generación.",
        });
      } else {
      const isReqAdmin = Boolean(
        session?.user?.isAdmin ||
        session?.user?.role === "admin" ||
        (session?.user?.email && (
          session.user.email.includes("obsifem") ||
          session.user.email.includes("admin") ||
          session.user.email.includes("mari") ||
          session.user.email.includes("bizbox")
        ))
      );
      const storedCustomKey = (session?.user && !isReqAdmin)
        ? await safeGetUserCustomApiKey({
            userId: session.user.id,
            email: session.user.email,
          })
        : null;
      const customKey =
        storedCustomKey && !isServerMasterKey(storedCustomKey)
          ? storedCustomKey
          : null;
      const apiKey = customKey || DEFAULT_MUAPI_KEY;

      if (apiKey) {
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

                const videoUrl = extractVideoUrl(checkData);
                if (upstreamStatus === "failed") {
                  failedError =
                    checkData.error || `Scene ${idx + 1} generation failed`;
                } else if (
                  upstreamStatus === "completed" ||
                  Boolean(videoUrl)
                ) {
                  if (videoUrl) {
                    updatedUrls[idx] = videoUrl;
                    hasChanges = true;
                  }
                }
              } catch (pollErr) {
                console.error(`Error polling segment ${idx + 1}:`, pollErr);
              }
            })
          );

          const allCompleted = updatedUrls.every(
            (u) => typeof u === "string" && u.length > 0
          );

          if (allCompleted) {
            creation = await safeUpdateCreationRecord(id, isDbRecord, {
              status: "completed",
              url: JSON.stringify(updatedUrls),
            });
          } else if (failedError && !updatedUrls.some(Boolean)) {
            creation = await safeUpdateCreationRecord(id, isDbRecord, {
              status: "failed",
              error: failedError,
            });
          } else if (hasChanges) {
            creation = await safeUpdateCreationRecord(id, isDbRecord, {
              url: JSON.stringify(updatedUrls),
            });
          }
        } else {
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
              const videoUrl = extractVideoUrl(checkData);

              if (upstreamStatus === "failed") {
                creation = await safeUpdateCreationRecord(id, isDbRecord, {
                  status: "failed",
                  error: checkData.error || "Generation failed",
                });
              } else if (
                upstreamStatus === "completed" ||
                Boolean(videoUrl)
              ) {
                creation = await safeUpdateCreationRecord(id, isDbRecord, {
                  status: "completed",
                  url: videoUrl,
                });
              } else if (upstreamStatus !== "processing") {
                creation = await safeUpdateCreationRecord(id, isDbRecord, {
                  status: upstreamStatus,
                });
              }
            } else if (checkRes.status === 401 || checkRes.status === 403) {
              creation = await safeUpdateCreationRecord(id, isDbRecord, {
                status: "failed",
                error: "API Key de MuAPI inválida o sin saldo en el motor de video.",
              });
            }
          } catch (pollErr) {
            console.error(
              "Error polling prediction status from upstream:",
              pollErr
            );
          }
        }
      }
    }
    }

    return NextResponse.json(formatCreationResponse(creation));
  } catch (error) {
    console.error("[CREATION_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Inicia sesión para eliminar videos." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const isAdmin = Boolean(
      session.user.isAdmin || session.user.role === "admin"
    );

    // 1. Remove from in-memory runtime store
    runtimeStore.creationsById.delete(id);

    // Also check if any memory item matches by requestId
    const decoded = decodeStatelessCreationId(id);
    const targetReqIds = decoded?.requestIds || [];
    for (const [memKey, memVal] of runtimeStore.creationsById.entries()) {
      if (
        memVal?.requestId === id ||
        (targetReqIds.length > 0 && targetReqIds.includes(memVal?.requestId))
      ) {
        runtimeStore.creationsById.delete(memKey);
      }
    }

    // 2. Remove from Prisma DB if connected (handles both direct ID and stateless requestId)
    if (prisma?.creation) {
      try {
        const orConditions = [{ id }];
        if (id.startsWith("mu_") || id.startsWith("mum_")) {
          for (const reqId of targetReqIds) {
            orConditions.push({ requestId: reqId });
            orConditions.push({ requestId: { contains: reqId } });
          }
        } else {
          orConditions.push({ requestId: id });
        }

        await prisma.creation.deleteMany({
          where: isAdmin
            ? { OR: orConditions }
            : { AND: [{ OR: orConditions }, { userId: session.user.id }] },
        });
      } catch (err) {
        console.warn("[SAFE_CREATION_DELETE_FALLBACK]", err?.message || err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Video eliminado correctamente.`,
      id,
    });
  } catch (error) {
    console.error("[CREATION_DELETE_ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "No se pudo eliminar el video" },
      { status: 500 }
    );
  }
}
