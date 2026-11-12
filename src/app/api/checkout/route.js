import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { BillingService } from "@/lib/services/billing";
import {
  CREDIT_PACKAGES,
  FREE_DEMO_PACKAGE,
  getPackageById,
  runtimeStore,
  safeAssignOrPurchaseCredits,
  safeGetUserBalance,
  safeHasClaimedDemo,
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
      stripeConfigured: isStripeConfigured(),
      packages: CREDIT_PACKAGES,
      demo: FREE_DEMO_PACKAGE,
      currentUser: balance,
    });
  } catch (err) {
    return NextResponse.json({
      enabled: true,
      stripeConfigured: isStripeConfigured(),
      packages: CREDIT_PACKAGES,
      error: err?.message,
    });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    const planId = body.planId || "demo";
    const pkg = getPackageById(planId);
    const targetEmail = (body.email || session?.user?.email || "")
      .toLowerCase()
      .trim();

    if (!targetEmail || !targetEmail.includes("@")) {
      return NextResponse.json(
        { error: "Ingresa un correo electrónico válido para continuar." },
        { status: 400 }
      );
    }

    const targetName =
      body.name || session?.user?.name || targetEmail.split("@")[0];

    const isSessionAdmin = Boolean(
      session?.user && (session.user.isAdmin || session.user.role === "admin")
    );

    // Free demo: strict 1-time claim checked against both runtimeStore & Prisma DB
    if (pkg.id === "demo") {
      if (isAdminEmail(targetEmail)) {
        return NextResponse.json(
          { error: "Las cuentas de administrador no usan el demo de comprador." },
          { status: 403 }
        );
      }

      const alreadyClaimed = await safeHasClaimedDemo({
        userId: session?.user?.id,
        email: targetEmail,
      });

      if (alreadyClaimed) {
        return NextResponse.json(
          {
            error:
              "Este correo ya reclamó su demo gratuito o ya tiene una cuenta registrada. Inicia sesión o elige un plan de pago.",
          },
          { status: 409 }
        );
      }

      const updatedUser = await safeAssignOrPurchaseCredits({
        email: targetEmail,
        userId: session?.user?.id,
        name: targetName,
        planId: "demo",
        customCredits: FREE_DEMO_PACKAGE.credits,
        mode: "set",
      });

      const rec = runtimeStore.usersByEmail.get(targetEmail);
      if (rec) {
        runtimeStore.usersByEmail.set(targetEmail, { ...rec, demoClaimed: true });
      }

      return NextResponse.json({
        success: true,
        approved: true,
        demo: true,
        message: `¡Demo activado! Se asignaron ${FREE_DEMO_PACKAGE.credits} créditos gratuitos a ${updatedUser.email}.`,
        package: FREE_DEMO_PACKAGE,
        user: updatedUser,
      });
    }

    // Paid plan: allow explicit Admin assignment OR real Stripe Checkout
    if (isSessionAdmin) {
      const updatedUser = await safeAssignOrPurchaseCredits({
        email: targetEmail,
        userId: session?.user?.id,
        name: targetName,
        planId: pkg.id,
        customCredits: body.customCredits ?? null,
        mode: body.mode || "add",
      });

      return NextResponse.json({
        success: true,
        approved: true,
        message: `Plan asignado por Administrador: +${pkg.credits.toLocaleString()} créditos (${pkg.name}) a ${updatedUser.email}.`,
        package: pkg,
        user: updatedUser,
      });
    }

    if (isStripeConfigured()) {
      const originUrl = new URL(req.url).origin;
      const checkoutUrl = await BillingService.createCheckoutSession(
        session?.user?.id || "",
        pkg.id,
        targetEmail,
        originUrl
      );

      return NextResponse.json({
        success: true,
        approved: false,
        requiresPayment: true,
        checkoutUrl,
        package: pkg,
      });
    }

    return NextResponse.json(
      {
        error:
          "Pagos en línea con Stripe pendientes de configuración (STRIPE_SECRET_KEY). Activa Stripe o solicita recarga al administrador.",
        stripeConfigured: false,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la solicitud de plan" },
      { status: 500 }
    );
  }
}
