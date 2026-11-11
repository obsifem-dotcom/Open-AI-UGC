import { prisma } from "./prisma";

export const ADMIN_INITIAL_CREDITS = 999999;

export const PRICING_CONFIG = {
  currency: "USD",
  billing_cycle: "monthly",
};

export const CREDIT_PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    priceUsd: 29,
    priceLabel: "$29 USD",
    originalPriceLabel: "$39 USD",
    billingCycle: "monthly",
    billingNote: "Facturación mensual • $29 USD/mes",
    costPerCreditLabel: "$0.0145 / CR",
    credits: 2000,
    videoEstimate: "10 - 15 videos cortos o carruseles al mes",
    videoCapacityLabel: "10 - 15 videos cortos o carruseles al mes",
    targetAudience: "Creadores independientes y emprendedores que inician",
    popular: false,
    badge: "Para Emprendedores",
    description:
      "Diseñado para creadores independientes y emprendedores que inician su presencia en redes y anuncios.",
    features: [
      "10 - 15 videos cortos o carruseles al mes (2,000 Créditos)",
      "Generación estándar con plantillas prediseñadas",
      "Voces sintéticas básicas",
      "Exportación en alta calidad",
      "15 Avatares de Stock / Estudio (7 idiomas)",
      "Entorno Virtual #8B5CF6 & Blanco + Croma Key",
    ],
    entitlements: [
      "10 - 15 videos cortos o carruseles al mes",
      "Generación estándar con plantillas prediseñadas",
      "Voces sintéticas básicas",
      "Exportación en alta calidad",
      "Uso comercial incluido",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    priceUsd: 79,
    priceLabel: "$79 USD",
    originalPriceLabel: "$99 USD",
    billingCycle: "monthly",
    billingNote: "Facturación mensual • $79 USD/mes",
    costPerCreditLabel: "$0.0131 / CR",
    credits: 6000,
    videoEstimate: "30 - 40 videos al mes (ritmo diario)",
    videoCapacityLabel: "30 - 40 videos al mes (ritmo diario)",
    targetAudience: "Pequeños negocios, marcas locales y creadores de contenido",
    popular: false,
    badge: "Marcas & Negocios",
    description:
      "Ideal para pequeños negocios, marcas locales y creadores que publican contenido a diario.",
    features: [
      "30 - 40 videos al mes (ritmo diario • 6,000 Créditos)",
      "Subtitulado automático y transiciones dinámicas",
      "Selección de avatares estándar de alta fidelidad",
      "Soporte para bloques de capítulos y videos más largos",
      "Ingesta E-Commerce por URL (Shopify / Amazon / ML)",
      "6 Estudios Virtuales HeyGen + Croma Key Pro",
    ],
    entitlements: [
      "30 - 40 videos al mes (ritmo diario)",
      "Subtitulado automático y transiciones dinámicas",
      "Selección de avatares estándar de alta fidelidad",
      "Soporte para bloques de capítulos y videos más largos",
      "Ingesta por URL E-Commerce + Text-To-Timeline",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    priceUsd: 199,
    priceLabel: "$199 USD",
    originalPriceLabel: "$249 USD",
    billingCycle: "monthly",
    billingNote: "Facturación mensual • $199 USD/mes",
    costPerCreditLabel: "$0.0099 / CR",
    credits: 20000,
    videoEstimate: "100 - 150 videos al mes o créditos expandidos",
    videoCapacityLabel: "100 - 150 videos al mes o créditos expandidos",
    targetAudience: "Agencias de marketing y creadores con pauta publicitaria",
    popular: true,
    badge: "⭐ El Más Elegido",
    description:
      "Para agencias de marketing y creadores con pauta publicitaria que necesitan escala y gemelos digitales.",
    features: [
      "100 - 150 videos al mes o créditos expandidos (20,000 Créditos)",
      "Clonación de voz y gemelos digitales básicos (Video 2-5m • #8B5CF6)",
      "Creación de Agentes de Ventas virtuales con guiones de venta",
      "Variantes automáticas de ganchos (hooks) y CTAs para anuncios",
      "10 Estudios Virtuales HeyGen + Fondos Personalizados",
      "Pipeline Universal YouTube Largo (4 Capítulos × 5 min + B-Roll 25s)",
    ],
    entitlements: [
      "100 - 150 videos al mes o créditos expandidos",
      "Clonación de voz y gemelos digitales básicos",
      "Creación de Agentes de Ventas virtuales con guiones de venta",
      "Variantes automáticas de ganchos (hooks) y CTAs para anuncios",
      "Pipeline YouTube Largo (4×5m) + 10 Estudios HeyGen",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceUsd: 499,
    priceLabel: "$499 USD",
    originalPriceLabel: "$599 USD",
    billingCycle: "monthly",
    billingNote: "Facturación mensual • $499 USD/mes",
    costPerCreditLabel: "$0.0083 / CR",
    credits: 60000,
    videoEstimate: "Volumen alto de generación de video con procesamiento prioritario",
    videoCapacityLabel: "Volumen alto de generación con procesamiento prioritario",
    targetAudience: "Empresas medianas, clínicas y equipos de alto rendimiento",
    popular: false,
    badge: "Empresarial & Equipos",
    description:
      "Potencia empresarial para empresas medianas, clínicas y equipos de alto rendimiento.",
    features: [
      "Volumen alto de generación de video con procesamiento prioritario (60,000 Créditos)",
      "Múltiples asientos de equipo y workspaces colaborativos",
      "Clonación avanzada de rostros y voces con ultra-realismo",
      "Automatización mediante flujos avanzados por lotes y multicanal",
      "Todos los motores en 1080p y 4K sin colas de espera",
      "Licencia comercial empresarial completa y soporte dedicado",
    ],
    entitlements: [
      "Volumen alto de generación con procesamiento prioritario",
      "Múltiples asientos de equipo y workspaces colaborativos",
      "Clonación avanzada de rostros y voces con ultra-realismo",
      "Automatización mediante flujos avanzados por lotes y multicanal",
      "Render 4K prioritario + Licencia Comercial Transferible",
    ],
  },
];

export const FREE_DEMO_PACKAGE = {
  id: "demo",
  name: "Demo Gratuito",
  priceUsd: 0,
  priceLabel: "GRATIS",
  originalPriceLabel: "",
  billingCycle: "once",
  billingNote: "Sin tarjeta • 1 demo por correo",
  costPerCreditLabel: "$0",
  credits: 150,
  videoEstimate: "1 - 2 videos cortos de prueba",
  videoCapacityLabel: "1 - 2 videos cortos de prueba (6s - 10s)",
  targetAudience: "Quienes quieren probar la aplicación antes de comprar",
  popular: false,
  badge: "Prueba Gratis",
  description:
    "Prueba UGCore Studio sin costo: genera tus primeros videos y conoce los avatares, estudios virtuales y el selector de hooks.",
  features: [
    "150 créditos de cortesía (1 - 2 videos cortos de prueba)",
    "Acceso a los 15 avatares de stock",
    "Entorno virtual #8B5CF6 & Blanco",
    "Selector de hooks virales y tendencias",
    "Sin tarjeta de crédito",
  ],
  entitlements: [
    "150 créditos únicos de prueba",
    "Videos cortos de hasta 10s",
    "15 avatares de stock y 1 entorno virtual",
    "Mejora a un plan de pago cuando quieras",
  ],
};

export function getPackageById(planId) {
  if (planId === "demo") return FREE_DEMO_PACKAGE;
  const normalizedId = planId === "pro" ? "professional" : planId;
  return (
    CREDIT_PACKAGES.find((p) => p.id === normalizedId || p.id === planId) ||
    CREDIT_PACKAGES[2] // default professional
  );
}

export const STUDIO_SHOWCASE_CREATIONS = [
  {
    id: "showcase-sofia-wellness-01",
    userId: "admin-obsifem",
    isShowcase: true,
    category: "influencer",
    type: "video",
    title: "Sofía Morales • Espacio Bienestar #8B5CF6 & Blanco",
    prompt:
      '@image1 as the AI influencer face and character speaking to camera. Virtual Studio Environment (Espacio de Bienestar #8B5CF6 & Blanco): serene architectural wellness sanctuary in pure white (#FFFFFF) and electric violet (#8B5CF6) LED coves. Speaking in Latin American Spanish with natural lip-sync: "¡Tienes que ver esto! Desde que probé nuestro Sérum Vitamina C Bio-Glow, mi piel luce radiante desde el primer día. Haz clic en el enlace de mi perfil ahora mismo."',
    requestId: "showcase_req_01",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    status: "completed",
    error: null,
    modelId: "grok-video",
    aspectRatio: "9:16",
    resolution: "720p",
    duration: 15,
    mode: "normal",
    environmentName: "✨ Bienestar #8B5CF6 & Blanco",
    influencerName: "Sofía Morales (UCID-SOFIA-01)",
    inputImages: JSON.stringify([
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    ]),
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "showcase-mateo-interview-02",
    userId: "admin-obsifem",
    isShowcase: true,
    category: "influencer",
    type: "video",
    title: "Mateo Rivas • Estudio de Entrevistas Moderno (HeyGen Set)",
    prompt:
      '@image1 as the AI influencer face and character speaking to camera. Virtual Studio Environment (Estudio de Entrevistas Moderno): high-end modern broadcast podcast studio with warm acoustic wood slat panels, broadcast microphone, and f/1.8 bokeh. Speaking in Latin American Spanish: "Si estás buscando automatizar tus ventas con IA en tiempo récord, esta plataforma transforma tus resultados sin complicaciones."',
    requestId: "showcase_req_02",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    status: "completed",
    error: null,
    modelId: "veo-3-1",
    aspectRatio: "9:16",
    resolution: "1080p",
    duration: 8,
    mode: "normal",
    environmentName: "🎙️ Estudio de Entrevistas Moderno",
    influencerName: "Mateo Rivas (UCID-MATEO-02)",
    inputImages: JSON.stringify([
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    ]),
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "showcase-youtube-longform-03",
    userId: "admin-obsifem",
    isShowcase: true,
    category: "longform",
    type: "video",
    title: "Pipeline YouTube Largo (4 Capítulos × 5m • B-Roll 25s • #8B5CF6)",
    prompt:
      '[YOUTUBE LONG-FORM 4 CHAPTERS (00:00-20:00)] Presenter (Alejandro Vega • UCID-ALEJANDRO-06) in Corporate Minimalist Set with #8B5CF6 violet rim lighting and #FFFFFF clean graphics. Auto B-Roll inserted every 25s (48 cuts). Chapters: 00:00 Fundamentos | 05:00 Arquitectura Paso a Paso | 10:00 Casos Reales | 15:00 Plan de Implementación.',
    requestId: JSON.stringify([
      "yt_ch1_req",
      "yt_ch2_req",
      "yt_ch3_req",
      "yt_ch4_req",
    ]),
    url: JSON.stringify([
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    ]),
    status: "completed",
    error: null,
    modelId: "grok-video",
    aspectRatio: "16:9",
    resolution: "720p",
    duration: 120,
    mode: "normal",
    environmentName: "🏢 Set Minimalista Corporativo (#8B5CF6)",
    influencerName: "Alejandro Vega (UCID-ALEJANDRO-06)",
    inputImages: JSON.stringify([
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    ]),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "showcase-camila-chroma-04",
    userId: "admin-obsifem",
    isShowcase: true,
    category: "chroma",
    type: "video",
    title: "Dra. Camila Ortiz • Consultorio Clínico & Croma Key Pro",
    prompt:
      '@image1 as the AI influencer face and character speaking to camera. Virtual Studio Environment (Consultorio Clínico Blanco): pristine modern aesthetic medical clinic with 6000K beauty lighting and precision chroma-key composite. Speaking in Latin American Spanish: "Agenda tu valoración personalizada hoy mismo con nuestro equipo especialista."',
    requestId: "showcase_req_04",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    status: "completed",
    error: null,
    modelId: "seedance-2",
    aspectRatio: "9:16",
    resolution: "720p",
    duration: 10,
    mode: "normal",
    environmentName: "🩺 Estudio Clínico / Croma Key Pro",
    influencerName: "Dra. Camila Ortiz (UCID-CAMILA-08)",
    inputImages: JSON.stringify([
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    ]),
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

// Global in-memory fallback store for serverless/local resilience when DB is unreachable
const globalStore = globalThis;
if (!globalStore.__ugcoreRuntimeStore) {
  globalStore.__ugcoreRuntimeStore = {
    usersByEmail: new Map([
      [
        "obsifem@gmail.com",
        {
          id: "admin-obsifem",
          name: "Administrador (UGCore Studio)",
          email: "obsifem@gmail.com",
          role: "admin",
          isAdmin: true,
          planId: "admin",
          planName: "Administrador Master",
          assignedCredits: ADMIN_INITIAL_CREDITS,
          credits: ADMIN_INITIAL_CREDITS,
          approved: true,
          updatedAt: new Date().toISOString(),
        },
      ],
      [
        "comprador@ugcorestudio.com",
        {
          id: "buyer-demo-01",
          name: "Usuario Comprador Pro",
          email: "comprador@ugcorestudio.com",
          role: "buyer",
          isAdmin: false,
          planId: "pro",
          planName: "Pack Pro Studio & YouTube ($79 USD)",
          assignedCredits: 10000,
          credits: 10000,
          approved: true,
          updatedAt: new Date().toISOString(),
        },
      ],
    ]),
    creationsById: new Map(
      STUDIO_SHOWCASE_CREATIONS.map((item) => [item.id, item])
    ),
  };
} else if (globalStore.__ugcoreRuntimeStore.creationsById.size === 0) {
  for (const item of STUDIO_SHOWCASE_CREATIONS) {
    globalStore.__ugcoreRuntimeStore.creationsById.set(item.id, item);
  }
}

export const runtimeStore = globalStore.__ugcoreRuntimeStore;

async function tryDbQuery(fn) {
  if (!prisma?.user) return null;
  const now = Date.now();
  if (runtimeStore.dbCooldownUntil && now < runtimeStore.dbCooldownUntil) {
    return null;
  }
  try {
    const result = await Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB_FAST_TIMEOUT")), 750)
      ),
    ]);
    runtimeStore.dbCooldownUntil = 0;
    return result;
  } catch (err) {
    runtimeStore.dbCooldownUntil = Date.now() + 90000;
    console.warn("[FAST_DB_FALLBACK]", err?.message || err);
    return null;
  }
}

export function encodeStatelessCreationId(requestIds, modelId = "grok-video") {
  const arr = Array.isArray(requestIds) ? requestIds : [requestIds];
  if (arr.length === 1) {
    return `mu_${arr[0]}`;
  }
  const payload = JSON.stringify({ r: arr, m: modelId });
  return `mum_${Buffer.from(payload, "utf8").toString("base64url")}`;
}

export function decodeStatelessCreationId(id) {
  if (!id || typeof id !== "string") return null;
  if (id.startsWith("mu_")) {
    const reqId = id.slice(3);
    return reqId ? { requestIds: [reqId], isMulti: false } : null;
  }
  if (id.startsWith("mum_")) {
    try {
      const raw = Buffer.from(id.slice(4), "base64url").toString("utf8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.r) && parsed.r.length > 0) {
        return { requestIds: parsed.r, isMulti: parsed.r.length > 1 };
      }
    } catch {
      return null;
    }
  }
  return null;
}

export async function safeGetOrCreateUser({
  email,
  name,
  isAdmin = false,
  planId = "standard",
  initialCredits = null,
  customApiKey = null,
}) {
  const cleanEmail = (email || "comprador@ugcorestudio.com")
    .toLowerCase()
    .trim();
  const pkg = getPackageById(planId);
  const existingMem = runtimeStore.usersByEmail.get(cleanEmail);

  const defaultCredits = isAdmin
    ? ADMIN_INITIAL_CREDITS
    : initialCredits !== null
    ? Number(initialCredits)
    : existingMem?.credits ?? pkg.credits;

  const assignedCredits = isAdmin
    ? ADMIN_INITIAL_CREDITS
    : initialCredits !== null
    ? Number(initialCredits)
    : existingMem?.assignedCredits ?? defaultCredits;

  const planName = isAdmin
    ? "Administrador Master"
    : existingMem?.planName || pkg.name;

  const dbUser = await tryDbQuery(async () => {
    let found = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (!found) {
      found = await prisma.user.create({
        data: {
          name:
            name ||
            (isAdmin ? "Administrador (UGCore Studio)" : "Usuario Comprador"),
          email: cleanEmail,
          credits: defaultCredits,
          customApiKey: customApiKey || null,
        },
      });
    } else if (isAdmin && found.credits < ADMIN_INITIAL_CREDITS) {
      found = await prisma.user.update({
        where: { id: found.id },
        data: { credits: ADMIN_INITIAL_CREDITS },
      });
    }
    return found;
  });

  const finalCredits = isAdmin
    ? ADMIN_INITIAL_CREDITS
    : dbUser?.credits ?? existingMem?.credits ?? defaultCredits;

  const userRecord = {
    id:
      dbUser?.id ||
      existingMem?.id ||
      (isAdmin
        ? "admin-obsifem"
        : `buyer-${Buffer.from(cleanEmail).toString("base64url").slice(0, 10)}`),
    name:
      dbUser?.name ||
      existingMem?.name ||
      name ||
      (isAdmin ? "Administrador (UGCore Studio)" : cleanEmail.split("@")[0]),
    email: cleanEmail,
    role: isAdmin ? "admin" : "buyer",
    isAdmin: Boolean(isAdmin),
    planId: isAdmin ? "admin" : existingMem?.planId || planId,
    planName,
    assignedCredits: Math.max(assignedCredits, finalCredits),
    credits: finalCredits,
    customApiKey:
      dbUser?.customApiKey || existingMem?.customApiKey || customApiKey || null,
    approved: true,
    updatedAt: new Date().toISOString(),
  };

  runtimeStore.usersByEmail.set(cleanEmail, userRecord);
  return userRecord;
}

export async function safeGetUserBalance({ userId, email, isAdmin = false }) {
  if (isAdmin) {
    return {
      credits: ADMIN_INITIAL_CREDITS,
      assignedCredits: ADMIN_INITIAL_CREDITS,
      planName: "Administrador Master",
      approved: true,
    };
  }

  const cleanEmail = email ? email.toLowerCase().trim() : null;
  const memUser = cleanEmail ? runtimeStore.usersByEmail.get(cleanEmail) : null;

  if (userId || cleanEmail) {
    const dbUser = await tryDbQuery(() =>
      prisma.user.findFirst({
        where: userId
          ? {
              OR: [
                { id: userId },
                ...(cleanEmail ? [{ email: cleanEmail }] : []),
              ],
            }
          : { email: cleanEmail },
      })
    );
    if (dbUser) {
      const assigned = Math.max(
        memUser?.assignedCredits || 0,
        dbUser.credits || 0
      );
      const updated = {
        ...(memUser || {}),
        id: dbUser.id,
        email: dbUser.email || cleanEmail,
        name: dbUser.name || memUser?.name || "Usuario Comprador",
        credits: dbUser.credits,
        assignedCredits: assigned || dbUser.credits,
        planName: memUser?.planName || "Paquete de Créditos Activo",
        approved: true,
      };
      if (updated.email) {
        runtimeStore.usersByEmail.set(updated.email, updated);
      }
      return updated;
    }
  }

  if (memUser) {
    return memUser;
  }

  return {
    credits: 1000,
    assignedCredits: 1000,
    planName: "Pack Básico (Activo)",
    approved: true,
  };
}

export async function safeAssignOrPurchaseCredits({
  email,
  userId,
  name,
  planId = "pro",
  customCredits = null,
  mode = "add", // "add" | "set"
}) {
  const pkg = getPackageById(planId);
  const creditDelta =
    customCredits !== null && !Number.isNaN(Number(customCredits))
      ? Number(customCredits)
      : pkg.credits;

  const cleanEmail = (email || "comprador@ugcorestudio.com")
    .toLowerCase()
    .trim();
  const existingMem = runtimeStore.usersByEmail.get(cleanEmail);

  let dbUser = null;
  try {
    if (prisma?.user) {
      dbUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            name: name || cleanEmail.split("@")[0],
            email: cleanEmail,
            credits: creditDelta,
          },
        });
      } else {
        const nextCredits =
          mode === "set"
            ? creditDelta
            : (Number(dbUser.credits) || 0) + creditDelta;
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { credits: nextCredits },
        });
      }
    }
  } catch (err) {
    console.warn("[SAFE_ASSIGN_CREDITS_FALLBACK]", err?.message || err);
  }

  const baseCredits = dbUser
    ? dbUser.credits
    : mode === "set"
    ? creditDelta
    : (existingMem?.credits || 0) + creditDelta;

  const assignedTotal =
    mode === "set"
      ? creditDelta
      : Math.max(baseCredits, (existingMem?.assignedCredits || 0) + creditDelta);

  const updatedRecord = {
    id:
      dbUser?.id ||
      existingMem?.id ||
      userId ||
      `buyer-${Buffer.from(cleanEmail).toString("base64url").slice(0, 10)}`,
    name: dbUser?.name || name || existingMem?.name || cleanEmail.split("@")[0],
    email: cleanEmail,
    role: cleanEmail === "obsifem@gmail.com" ? "admin" : "buyer",
    isAdmin: cleanEmail === "obsifem@gmail.com",
    planId: pkg.id,
    planName: pkg.name,
    assignedCredits: assignedTotal,
    credits: baseCredits,
    approved: true,
    updatedAt: new Date().toISOString(),
  };

  runtimeStore.usersByEmail.set(cleanEmail, updatedRecord);
  return updatedRecord;
}

export async function safeDeductCredits({ userId, email, amount }) {
  const cleanAmount = Math.max(0, Number(amount) || 0);
  if (cleanAmount <= 0) return;

  const cleanEmail = email ? email.toLowerCase().trim() : null;
  if (cleanEmail && runtimeStore.usersByEmail.has(cleanEmail)) {
    const cur = runtimeStore.usersByEmail.get(cleanEmail);
    if (!cur.isAdmin) {
      cur.credits = Math.max(0, (Number(cur.credits) || 0) - cleanAmount);
      cur.updatedAt = new Date().toISOString();
      runtimeStore.usersByEmail.set(cleanEmail, cur);
    }
  }

  try {
    if (prisma?.user && (userId || cleanEmail)) {
      if (userId && !String(userId).startsWith("buyer-") && userId !== "admin-obsifem") {
        await prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: cleanAmount } },
        });
      } else if (cleanEmail) {
        await prisma.user.update({
          where: { email: cleanEmail },
          data: { credits: { decrement: cleanAmount } },
        });
      }
    }
  } catch (err) {
    console.warn("[SAFE_DEDUCT_CREDITS_FALLBACK]", err?.message || err);
  }
}

export async function safeListUsers() {
  const merged = new Map();
  for (const [email, u] of runtimeStore.usersByEmail.entries()) {
    merged.set(email, u);
  }

  try {
    if (prisma?.user) {
      const dbUsers = await prisma.user.findMany({
        orderBy: { email: "asc" },
        take: 100,
      });
      for (const dbu of dbUsers) {
        if (!dbu.email) continue;
        const key = dbu.email.toLowerCase().trim();
        const mem = merged.get(key);
        const isAdm = key === "obsifem@gmail.com";
        merged.set(key, {
          id: dbu.id,
          name: dbu.name || mem?.name || key.split("@")[0],
          email: key,
          role: isAdm ? "admin" : "buyer",
          isAdmin: isAdm,
          planId: mem?.planId || (isAdm ? "admin" : "standard"),
          planName:
            mem?.planName ||
            (isAdm ? "Administrador Master" : "Paquete Comprador Activo"),
          assignedCredits: isAdm
            ? ADMIN_INITIAL_CREDITS
            : Math.max(mem?.assignedCredits || 0, dbu.credits || 0),
          credits: isAdm ? ADMIN_INITIAL_CREDITS : dbu.credits ?? 0,
          approved: true,
          updatedAt: mem?.updatedAt || new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn("[SAFE_LIST_USERS_FALLBACK]", err?.message || err);
  }

  return Array.from(merged.values());
}

export async function safeCreateCreation({
  userId,
  userEmail,
  prompt,
  requestIds,
  modelId,
  aspectRatio,
  resolution,
  duration,
  mode,
  images,
}) {
  const isMultiSegment = requestIds.length > 1;
  const serializedRequestId = isMultiSegment
    ? JSON.stringify(requestIds)
    : requestIds[0];
  const initialUrl = isMultiSegment
    ? JSON.stringify(new Array(requestIds.length).fill(null))
    : null;
  const statelessId = encodeStatelessCreationId(requestIds, modelId);

  const fallbackCreation = {
    id: statelessId,
    userId: userId || "admin-obsifem",
    type: "video",
    title: (prompt || "UGCore Video").substring(0, 50) + "...",
    prompt: prompt || "",
    requestId: serializedRequestId,
    url: initialUrl,
    status: "processing",
    error: null,
    modelId,
    aspectRatio: aspectRatio || "9:16",
    resolution: resolution || "720p",
    duration: duration || 6,
    mode: mode || null,
    inputImages: images && images.length > 0 ? JSON.stringify(images) : null,
    createdAt: new Date().toISOString(),
  };

  runtimeStore.creationsById.set(statelessId, fallbackCreation);

  try {
    if (prisma?.creation && prisma?.user) {
      let validDbUserId = userId;
      const cleanEmail = (userEmail || "obsifem@gmail.com")
        .toLowerCase()
        .trim();

      const dbUser = await prisma.user.upsert({
        where: { email: cleanEmail },
        update: {},
        create: {
          name:
            cleanEmail === "obsifem@gmail.com"
              ? "Administrador (UGCore Studio)"
              : cleanEmail.split("@")[0],
          email: cleanEmail,
          credits:
            cleanEmail === "obsifem@gmail.com" ? ADMIN_INITIAL_CREDITS : 1000,
        },
      });
      validDbUserId = dbUser.id;

      const dbCreation = await prisma.creation.create({
        data: {
          userId: validDbUserId,
          type: "video",
          title: fallbackCreation.title,
          prompt: fallbackCreation.prompt,
          requestId: serializedRequestId,
          url: initialUrl,
          status: "processing",
          modelId,
          aspectRatio: aspectRatio || null,
          resolution: resolution || null,
          duration: duration || null,
          mode: mode || null,
          inputImages: fallbackCreation.inputImages,
        },
      });

      runtimeStore.creationsById.set(dbCreation.id, dbCreation);
      return dbCreation;
    }
  } catch (err) {
    console.warn(
      "[SAFE_CREATE_CREATION_FALLBACK] Using stateless creation token:",
      err?.message || err
    );
  }

  return fallbackCreation;
}

