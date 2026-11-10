import { NextResponse } from "next/server";
import {
  generatePredictiveHooks,
  SOCIAL_PLATFORMS,
  HOOK_FRAMEWORKS,
} from "@/lib/ugcore-v3";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      topic = "",
      benefit = "",
      platform = "tiktok",
      promoType = "product",
    } = body || {};

    const hooks = generatePredictiveHooks({
      topic,
      benefit,
      platform,
      promoType,
    });

    return NextResponse.json({
      success: true,
      engine: "UGCore Pre-Production Intelligence v3.0",
      platform,
      platforms: SOCIAL_PLATFORMS,
      frameworks: HOOK_FRAMEWORKS,
      hooks,
    });
  } catch (error) {
    console.error("[INTELLIGENCE_HOOKS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to generate predictive hooks" },
      { status: 500 }
    );
  }
}
