import { NextResponse } from "next/server";
import { isStripeConfigured, isStripeWebhookConfigured } from "@/lib/stripe";
import { BillingService } from "@/lib/services/billing";

export async function POST(req) {
  if (!isStripeConfigured() || !isStripeWebhookConfigured()) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header." },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const result = await BillingService.handleWebhook(rawBody, signature);
    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    console.error("[STRIPE_WEBHOOK_ERROR]", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Invalid Stripe webhook payload." },
      { status: 400 }
    );
  }
}
