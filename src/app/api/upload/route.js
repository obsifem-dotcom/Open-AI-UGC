import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, DEFAULT_MUAPI_KEY, isServerMasterKey } from "@/lib/auth";
import { safeGetUserCustomApiKey } from "@/lib/runtime-store";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Inicia sesión para subir imágenes o archivos." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo." },
        { status: 400 }
      );
    }

    const storedCustomKey = await safeGetUserCustomApiKey({
      userId: session.user.id,
      email: session.user.email,
    });
    const customKey =
      storedCustomKey && !isServerMasterKey(storedCustomKey)
        ? storedCustomKey
        : null;
    const apiKey = customKey || DEFAULT_MUAPI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key del motor de subida no configurada en el servidor." },
        { status: 500 }
      );
    }

    // Prepare for MuAPI
    const muapiFormData = new FormData();
    muapiFormData.append("file", file);

    const response = await fetch("https://api.muapi.ai/api/v1/upload_file", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: muapiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MuAPI Upload Failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    // Expected response format: { url: "...", file_id: "..." }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
