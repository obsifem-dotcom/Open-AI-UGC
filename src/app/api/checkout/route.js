import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  CREDIT_PACKAGES,
  FREE_DEMO_PACKAGE,
  getPackageById,
  runtimeStore,
  safeAssignOrPurchaseCredits,
  safeGetUserBalance,
} from "@/lib/runtime-store";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const balance = session?.user
      ? await safeGetUserBalance({
          userId: session.user.id,
          email: session.user.email,
          isAdmin: session.user.isAdmin,
        })
      : null;

    return NextResponse.json({
      enabled: true,
      packages: CREDIT_PACKAGES,
      demo: FREE_DEMO_PACKAGE,
      currentUser: balance,
    });
  } catch (err) {
    return NextResponse.json({
      enabled: true,
      packages: CREDIT_PACKAGES,
      error: err?.message,
    });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const planId = body.planId || "pro";
    const pkg = getPackageById(planId);
    const targetEmail = (
      body.email ||
      session?.user?.email ||
      "comprador@ugcorestudio.com"
    )
      .toLowerCase()
      .trim();
    const targetName =
      body.name || session?.user?.name || targetEmail.split("@")[0];

    // Free demo: one claim per email, never overrides a paid plan
    if (pkg.id === "demo") {
      const existing = runtimeStore.usersByEmail.get(targetEmail);
      if (existing?.demoClaimed) {
        return NextResponse.json(
          { error: "Este correo ya reclamó su demo gratuito. Elige un plan de pago para continuar." },
          { status: 409 }
        );
      }
      if (existing && existing.planId && existing.planId !== "demo") {
        return NextResponse.json(
          { error: "Tu cuenta ya tiene un plan activo; el demo gratuito no aplica." },
          { status: 409 }
        );
      }
    }

    const updatedUser = await safeAssignOrPurchaseCredits({
      email: targetEmail,
      userId: session?.user?.id,
      name: targetName,
      planId: pkg.id,
      customCredits: body.customCredits ?? null,
      mode: pkg.id === "demo" ? "set" : body.mode || "add",
    });

    if (pkg.id === "demo") {
      const rec = runtimeStore.usersByEmail.get(targetEmail);
      if (rec) runtimeStore.usersByEmail.set(targetEmail, { ...rec, demoClaimed: true });
    }

    return NextResponse.json({
      success: true,
      approved: true,
      message: `¡Compra aprobada! Se asignaron +${pkg.credits.toLocaleString()} créditos (${pkg.name}) a ${updatedUser.email}.`,
      package: pkg,
      user: updatedUser,
    });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la asignación de créditos" },
      { status: 500 }
    );
  }
}
