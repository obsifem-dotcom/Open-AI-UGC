import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, DEFAULT_MUAPI_KEY, isServerMasterKey } from "@/lib/auth";
import { safeGetUserCustomApiKey } from "@/lib/runtime-store";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo." },
        { status: 400 }
      );
    }

    const storedCustomKey = session?.user
      ? await safeGetUserCustomApiKey({
          userId: session.user.id,
          email: session.user.email,
        })
      : null;
    const customKey =
      storedCustomKey && !isServerMasterKey(storedCustomKey)
        ? storedCustomKey
        : null;
    const apiKey = customKey || DEFAULT_MUAPI_KEY;

    // Prepare for MuAPI
    if (apiKey) {
      try {
        const muapiFormData = new FormData();
        muapiFormData.append("file", file);

        const response = await fetch("https://api.muapi.ai/api/v1/upload_file", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
          },
          body: muapiFormData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.url) {
            return NextResponse.json(data);
          }
        } else {
          const errorText = await response.text();
          console.warn(`[MUAPI_UPLOAD_FALLBACK] ${response.status} ${errorText}`);
        }
      } catch (uploadErr) {
        console.warn("[MUAPI_UPLOAD_NETWORK_FALLBACK]", uploadErr?.message || uploadErr);
      }
    }

    // Fallback: return inline Data URI so image upload never fails or blocks video generation
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      file_id: `local_${Date.now()}`,
      fallback: true,
    });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
