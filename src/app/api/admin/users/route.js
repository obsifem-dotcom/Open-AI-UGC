import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import {
  ADMIN_INITIAL_CREDITS,
  CREDIT_PACKAGES,
  safeListUsers,
  safeAssignOrPurchaseCredits,
} from "@/lib/runtime-store";

export async function GET() {
  try {
    const users = await safeListUsers();
    return NextResponse.json({
      adminCredits: ADMIN_INITIAL_CREDITS,
      packages: CREDIT_PACKAGES,
      users,
    });
  } catch (error) {
    console.error("[ADMIN_USERS_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = Boolean(
      !session?.user ||
        session.user.isAdmin ||
        session.user.role === "admin" ||
        isAdminEmail(session.user.email)
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Permisos de Administrador requeridos" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Ingresa un correo de comprador válido" },
        { status: 400 }
      );
    }

    const updatedUser = await safeAssignOrPurchaseCredits({
      email,
      name: body.name || email.split("@")[0],
      planId: body.planId || "pro",
      customCredits:
        body.customCredits !== undefined && body.customCredits !== ""
          ? Number(body.customCredits)
          : null,
      mode: body.mode || "add",
    });

    const users = await safeListUsers();

    return NextResponse.json({
      success: true,
      user: updatedUser,
      users,
    });
  } catch (error) {
    console.error("[ADMIN_USERS_POST_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Error al aprobar/asignar créditos" },
      { status: 500 }
    );
  }
}
