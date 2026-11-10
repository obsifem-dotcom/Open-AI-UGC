import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, DEFAULT_MUAPI_KEY } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJsonArray, formatCreationResponse } from "@/lib/creations";
import {
  runtimeStore,
  decodeStatelessCreationId,
} from "@/lib/runtime-store";

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

    const activeStatuses = ["processing", "pending", "starting", "queued"];
    if (activeStatuses.includes(creation.status) && creation.requestId) {
      const apiKey =
        session?.user?.customApiKey ||
        process.env.UGC_API_KEY ||
        process.env.MUAPIAPP_API_KEY ||
        DEFAULT_MUAPI_KEY;

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

              if (upstreamStatus === "failed") {
                creation = await safeUpdateCreationRecord(id, isDbRecord, {
                  status: "failed",
                  error: checkData.error || "Generation failed",
                });
              } else if (
                upstreamStatus === "completed" ||
                (checkData.outputs && checkData.outputs.length > 0)
              ) {
                const outputs = checkData.outputs || [];
                const videoUrl = outputs.length > 0 ? outputs[0] : null;

                creation = await safeUpdateCreationRecord(id, isDbRecord, {
                  status: "completed",
                  url: videoUrl,
                });
              } else if (upstreamStatus !== "processing") {
                creation = await safeUpdateCreationRecord(id, isDbRecord, {
                  status: upstreamStatus,
                });
              }
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

    return NextResponse.json(formatCreationResponse(creation));
  } catch (error) {
    console.error("[CREATION_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
