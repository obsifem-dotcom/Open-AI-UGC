import { stripe, isStripeConfigured, isStripeWebhookConfigured } from "../stripe";
import config from "../config";
import { getPackageById } from "../plans";
import { safeAssignOrPurchaseCredits } from "../runtime-store";

export const BillingService = {
  async createCheckoutSession(userId, planId, email = "", originUrl = "") {
    if (!isStripeConfigured()) {
      throw new Error("Stripe no está configurado en el servidor.");
    }

    const pkg = getPackageById(planId);
    if (!pkg || pkg.id === "demo" || !pkg.price || pkg.price <= 0) {
      throw new Error("Plan seleccionado no válido para pago.");
    }

    const baseUrl = (originUrl || config.auth.url || "http://localhost:3000").replace(
      /\/+$/,
      ""
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      ...(email ? { customer_email: email.toLowerCase().trim() } : {}),
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: pkg.name,
              description: `${pkg.credits.toLocaleString()} créditos para generar videos en UGCore Studio`,
            },
            unit_amount: Math.round(pkg.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/pricing?success=true&plan=${encodeURIComponent(pkg.id)}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        userId: String(userId || ""),
        email: String(email || "").toLowerCase().trim(),
        planId: pkg.id,
        credits: String(pkg.credits),
      },
    });

    return session.url;
  },

  async handleWebhook(body, signature) {
    if (!isStripeConfigured() || !isStripeWebhookConfigured()) {
      throw new Error("Stripe webhook no está configurado en el servidor.");
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || config.stripe.webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId || "";
      const email =
        session.metadata?.email ||
        session.customer_details?.email ||
        session.customer_email ||
        "";
      const planId = session.metadata?.planId || "basic";
      const credits = parseInt(session.metadata?.credits || "0", 10);

      if ((email || userId) && credits > 0) {
        const updatedUser = await safeAssignOrPurchaseCredits({
          email,
          userId,
          planId,
          customCredits: credits,
          mode: "add",
        });
        return {
          success: true,
          userId: updatedUser.id,
          email: updatedUser.email,
          credits,
        };
      }
    }
    return { success: false };
  },
};

export const createCheckoutSession = BillingService.createCheckoutSession.bind(BillingService);
export const handleWebhook = BillingService.handleWebhook.bind(BillingService);
export default BillingService;

