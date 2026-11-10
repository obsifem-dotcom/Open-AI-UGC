import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCreationResponse } from "@/lib/creations";
import { runtimeStore } from "@/lib/runtime-store";

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
    for (const [id, item] of runtimeStore.creationsById.entries()) {
      if (isAdmin || item.userId === activeUser?.id) {
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

    const list = Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    return NextResponse.json(list.map(formatCreationResponse));
  } catch (error) {
    console.error("[CREATIONS_GET_ERROR]", error);
    return NextResponse.json([], { status: 200 });
  }
}
