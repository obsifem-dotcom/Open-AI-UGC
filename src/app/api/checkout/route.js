import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { isStripeConfigured } from "@/lib/stripe";
import { BillingService } from "@/lib/services/billing";
import {
  isLemonSqueezyConfigured,
  LemonSqueezyService,
} from "@/lib/lemonsqueezy";
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
      lemonSqueezyConfigured: isLemonSqueezyConfigured(),
      stripeConfigured: isStripeConfigured(),
      packages: CREDIT_PACKAGES,
      demo: FREE_DEMO_PACKAGE,
      currentUser: balance,
    });
  } catch (err) {
    return NextResponse.json({
      enabled: true,
      lemonSqueezyConfigured: isLemonSqueezyConfigured(),
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

    // Free demo: activate 300 free credits for any buyer test
    if (pkg.id === "demo") {
      if (isAdminEmail(targetEmail)) {
        return NextResponse.json(
          { error: "Las cuentas de administrador no usan el demo de comprador. Ingresa como Administrador con tu contraseña." },
          { status: 403 }
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
        message: `¡Demo Gratuito activado! Se asignaron ${FREE_DEMO_PACKAGE.credits} créditos a ${updatedUser.email}.`,
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

    // 1. Check Lemon Squeezy first (Merchant of Record - Global Tax & Compliance)
    if (isLemonSqueezyConfigured()) {
      const originUrl = new URL(req.url).origin;
      const checkoutUrl = await LemonSqueezyService.createCheckout({
        userId: session?.user?.id || "",
        planId: pkg.id,
        email: targetEmail,
        name: targetName,
        originUrl,
      });

      return NextResponse.json({
        success: true,
        provider: "lemonsqueezy",
        approved: false,
        requiresPayment: true,
        checkoutUrl,
        package: pkg,
      });
    }

    // 2. Stripe Checkout fallback
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
        provider: "stripe",
        approved: false,
        requiresPayment: true,
        checkoutUrl,
        package: pkg,
      });
    }

    // When Stripe is not yet configured with production keys:
    // Allow seamless test activation so buyers and testers can verify the full subscription flow
    const updatedUser = await safeAssignOrPurchaseCredits({
      email: targetEmail,
      userId: session?.user?.id,
      name: targetName,
      planId: pkg.id,
      customCredits: pkg.credits,
      mode: "add",
    });

    return NextResponse.json({
      success: true,
      approved: true,
      simulated: true,
      stripeConfigured: false,
      message: `¡Pago de prueba completado! Plan ${pkg.name} (${pkg.priceLabel}) activado con éxito: +${pkg.credits.toLocaleString()} créditos acreditados a ${updatedUser.email}.`,
      package: pkg,
      user: updatedUser,
    });
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar la solicitud de plan" },
      { status: 500 }
    );
  }
}
