import { NextResponse } from "next/server";

export async function POST(req) {
  return NextResponse.json(
    { error: "Online payments are not enabled yet." },
    { status: 503 }
  );
}
