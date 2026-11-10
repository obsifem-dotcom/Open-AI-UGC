import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonArray } from "@/lib/creations";

export async function POST(req) {
  try {
    const data = await req.json();
    console.log("[MUAPI_WEBHOOK_RECEIVED]", data);

    const requestId = data.id || data.request_id;

    if (!requestId) {
      console.error("[MUAPI_WEBHOOK_ERROR] Missing request id in payload", data);
      return NextResponse.json({ error: "Missing request id" }, { status: 400 });
    }

    let creation = await prisma.creation.findUnique({
      where: { requestId },
    });

    if (!creation) {
      creation = await prisma.creation.findFirst({
        where: { requestId: { contains: requestId } },
      });
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

      if (data.status === "completed" || data.outputs) {
        const outputs = data.outputs || [];
        if (outputs[0]) {
          updatedUrls[segIndex] = outputs[0];
        }
      }

      const allCompleted = updatedUrls.every(
        (u) => typeof u === "string" && u.length > 0
      );

      if (allCompleted) {
        await prisma.creation.update({
          where: { id: creation.id },
          data: {
            status: "completed",
            url: JSON.stringify(updatedUrls),
          },
        });
      } else if (data.status === "failed" && !updatedUrls.some(Boolean)) {
        await prisma.creation.update({
          where: { id: creation.id },
          data: {
            status: "failed",
            error: data.error || "Generation failed",
          },
        });
      } else {
        await prisma.creation.update({
          where: { id: creation.id },
          data: {
            url: JSON.stringify(updatedUrls),
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (data.status === "failed" || (data.error && data.error !== "")) {
      await prisma.creation.update({
        where: { id: creation.id },
        data: {
          status: "failed",
          error: data.error || "Generation failed",
        },
      });
    } else if (data.status === "completed" || data.outputs) {
      const outputs = data.outputs || [];
      const videoUrl = outputs.length > 0 ? outputs[0] : null;

      await prisma.creation.update({
        where: { id: creation.id },
        data: {
          status: "completed",
          url: videoUrl,
        },
      });
    } else {
      await prisma.creation.update({
        where: { id: creation.id },
        data: {
          status: data.status || "processing",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[MUAPI_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
