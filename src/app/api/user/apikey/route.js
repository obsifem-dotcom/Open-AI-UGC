import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isServerMasterKey } from "@/lib/auth";
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

    if (apiKey && isServerMasterKey(apiKey)) {
      return NextResponse.json(
        { error: "Ingresa tu propia API Key personal (no la llave del servidor)." },
        { status: 400 }
      );
    }

    const cleanEmail = session.user.email
      ? session.user.email.toLowerCase().trim()
      : null;

    if (cleanEmail) {
      const mem = runtimeStore.usersByEmail.get(cleanEmail) || {};
      runtimeStore.usersByEmail.set(cleanEmail, {
        ...mem,
        email: cleanEmail,
        customApiKey: apiKey,
      });
    }

    if (prisma?.user && (session.user.id || cleanEmail)) {
      try {
        await prisma.user.update({
          where: cleanEmail ? { email: cleanEmail } : { id: session.user.id },
          data: { customApiKey: apiKey },
        });
      } catch (err) {
        console.warn("[SAFE_APIKEY_UPDATE_FALLBACK]", err?.message || err);
      }
    }

    return NextResponse.json({
      success: true,
      hasCustomApiKey: Boolean(apiKey),
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

    if (prisma?.user && (session.user.id || session.user.email)) {
      try {
        const cleanEmail = session.user.email
          ? session.user.email.toLowerCase().trim()
          : null;
        await prisma.user.update({
          where: cleanEmail ? { email: cleanEmail } : { id: session.user.id },
          data: { customApiKey: null },
        });
      } catch (err) {
        console.warn("[SAFE_APIKEY_CLEAR_FALLBACK]", err?.message || err);
      }
    }

    return NextResponse.json({ success: true, hasCustomApiKey: false });
  } catch (error) {
    console.error("Error clearing custom API key:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove API key" },
      { status: 500 }
    );
  }
}
