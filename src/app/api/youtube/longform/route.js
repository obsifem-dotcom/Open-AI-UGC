import { NextResponse } from "next/server";
import {
  YOUTUBE_LONGFORM_CONFIG,
  buildYouTubeLongFormBlueprint,
} from "@/lib/ugcore-v3";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const topic =
    searchParams.get("topic") ||
    "Estrategias de Automatización e Inteligencia Artificial para Escalar Negocios Digitales";
  const influencerName =
    searchParams.get("influencerName") || "Presentador IA";

  const blueprint = buildYouTubeLongFormBlueprint({
    topic,
    influencerName,
    bRollIntervalSeconds: 25,
    primaryHex: "#8B5CF6",
    secondaryHex: "#FFFFFF",
  });

  return NextResponse.json({
    ok: true,
    pipeline: YOUTUBE_LONGFORM_CONFIG,
    blueprint,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      topic = "",
      influencerName = "Presentador IA",
      bRollIntervalSeconds = 25,
      primaryHex = "#8B5CF6",
      secondaryHex = "#FFFFFF",
    } = body || {};

    const blueprint = buildYouTubeLongFormBlueprint({
      topic,
      influencerName,
      bRollIntervalSeconds,
      primaryHex,
      secondaryHex,
    });

    return NextResponse.json({
      ok: true,
      pipeline: YOUTUBE_LONGFORM_CONFIG,
      blueprint,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Error al estructurar el flujo de YouTube largo" },
      { status: 500 }
    );
  }
}

