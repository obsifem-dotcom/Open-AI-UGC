import { NextResponse } from "next/server";
import { isLemonSqueezyConfigured, LemonSqueezyService } from "@/lib/lemonsqueezy";

export async function POST(req) {
  try {
    const signature = req.headers.get("x-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-signature header from Lemon Squeezy." },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const result = await LemonSqueezyService.handleWebhook(rawBody, signature);
    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    console.error("[LEMONSQUEEZY_WEBHOOK_ERROR]", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Invalid Lemon Squeezy webhook payload." },
      { status: 400 }
    );
  }
}

