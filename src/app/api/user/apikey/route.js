import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runtimeStore } from "@/lib/runtime-store";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const apiKey = body.apiKey ? String(body.apiKey).trim() : null;

    if (session.user.email) {
      const cleanEmail = session.user.email.toLowerCase().trim();
      const mem = runtimeStore.usersByEmail.get(cleanEmail) || {};
      runtimeStore.usersByEmail.set(cleanEmail, {
        ...mem,
        email: cleanEmail,
        customApiKey: apiKey,
      });
    }

    if (prisma?.user) {
      try {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { customApiKey: apiKey },
        });
      } catch (err) {
        console.warn("[SAFE_APIKEY_UPDATE_FALLBACK]", err?.message || err);
      }
    }

    return NextResponse.json({
      success: true,
      customApiKey: apiKey,
    });
  } catch (error) {
    console.error("Error updating custom API key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update API key" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.email) {
      const cleanEmail = session.user.email.toLowerCase().trim();
      const mem = runtimeStore.usersByEmail.get(cleanEmail) || {};
      runtimeStore.usersByEmail.set(cleanEmail, {
        ...mem,
        email: cleanEmail,
        customApiKey: null,
      });
    }

    if (prisma?.user) {
      try {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { customApiKey: null },
        });
      } catch (err) {
        console.warn("[SAFE_APIKEY_CLEAR_FALLBACK]", err?.message || err);
      }
    }

    return NextResponse.json({ success: true, customApiKey: null });
  } catch (error) {
    console.error("Error clearing custom API key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove API key" },
      { status: 500 }
    );
  }
}
