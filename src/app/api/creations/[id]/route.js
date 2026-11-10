import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, DEFAULT_MUAPI_KEY, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJsonArray, formatCreationResponse } from "@/lib/creations";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const isAdmin = Boolean(
      session.user.isAdmin ||
        session.user.role === "admin" ||
        isAdminEmail(session.user.email)
    );

    let creation = await prisma.creation.findUnique({
      where: isAdmin
        ? { id }
        : {
            id,
            userId: session.user.id,
          },
    });

    if (!creation) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Active polling fallback for both single-clip and multi-segment long videos
    const activeStatuses = ["processing", "pending", "starting", "queued"];
    if (activeStatuses.includes(creation.status) && creation.requestId) {
      const apiKey =
        session.user.customApiKey ||
        process.env.UGC_API_KEY ||
        process.env.MUAPIAPP_API_KEY ||
        DEFAULT_MUAPI_KEY;

      if (apiKey) {
        const multiRequestIds = parseJsonArray(creation.requestId);

        if (multiRequestIds && multiRequestIds.length > 0) {
          // Multi-segment long video polling
          const rawUrls =
            parseJsonArray(creation.url) || new Array(multiRequestIds.length).fill(null);
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
                  failedError = checkData.error || `Scene ${idx + 1} generation failed`;
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
            creation = await prisma.creation.update({
              where: { id },
              data: {
                status: "completed",
                url: JSON.stringify(updatedUrls),
              },
            });
          } else if (failedError && !updatedUrls.some(Boolean)) {
            creation = await prisma.creation.update({
              where: { id },
              data: {
                status: "failed",
                error: failedError,
              },
            });
          } else if (hasChanges) {
            creation = await prisma.creation.update({
              where: { id },
              data: {
                url: JSON.stringify(updatedUrls),
              },
            });
          }
        } else {
          // Single-clip polling
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
                creation = await prisma.creation.update({
                  where: { id },
                  data: {
                    status: "failed",
                    error: checkData.error || "Generation failed",
                  },
                });
              } else if (
                upstreamStatus === "completed" ||
                (checkData.outputs && checkData.outputs.length > 0)
              ) {
                const outputs = checkData.outputs || [];
                const videoUrl = outputs.length > 0 ? outputs[0] : null;

                creation = await prisma.creation.update({
                  where: { id },
                  data: {
                    status: "completed",
                    url: videoUrl,
                  },
                });
              } else if (upstreamStatus !== "processing") {
                creation = await prisma.creation.update({
                  where: { id },
                  data: {
                    status: upstreamStatus,
                  },
                });
              }
            }
          } catch (pollErr) {
            console.error("Error polling prediction status from upstream:", pollErr);
          }
        }
      }
    }

    return NextResponse.json(formatCreationResponse(creation));
  } catch (error) {
    console.error("[CREATION_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
