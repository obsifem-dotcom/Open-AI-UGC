import { prisma } from "./prisma";
import {
  ADMIN_INITIAL_CREDITS,
  PRICING_CONFIG,
  CREDIT_PACKAGES,
  FREE_DEMO_PACKAGE,
  getPackageById,
} from "./plans";

export {
  ADMIN_INITIAL_CREDITS,
  PRICING_CONFIG,
  CREDIT_PACKAGES,
  FREE_DEMO_PACKAGE,
  getPackageById,
};


export const STUDIO_SHOWCASE_CREATIONS = [];

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
        setTimeout(() => reject(new Error("DB_FAST_TIMEOUT")), 6000)
      ),
    ]);
    runtimeStore.dbCooldownUntil = 0;
    return result;
  } catch (err) {
    runtimeStore.dbCooldownUntil = Date.now() + 5000;
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
  phone = null,
  isAdmin = false,
  planId = "demo",
  initialCredits = null,
  customApiKey = null,
}) {
  const cleanEmail = (email || "").toLowerCase().trim();
  if (!cleanEmail) {
    return null;
  }
  const cleanPhone =
    typeof phone === "string" && phone.trim().length > 0 ? phone.trim() : null;
  const pkg = getPackageById(planId);
  const existingMem = runtimeStore.usersByEmail.get(cleanEmail);
  const cleanCustomKey =
    typeof customApiKey === "string" && customApiKey.trim().length > 0
      ? customApiKey.trim()
      : null;

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

  let existedInDb = false;
  const dbUser = await tryDbQuery(async () => {
    let found = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (!found) {
      found = await prisma.user.create({
        data: {
          name:
            name ||
            (isAdmin ? "Administrador (UGCore Studio)" : "Usuario UGCore"),
          email: cleanEmail,
          emailVerified: new Date(),
          image: cleanPhone ? `phone:${cleanPhone}` : null,
          credits: defaultCredits,
          customApiKey: cleanCustomKey,
        },
      });
    } else {
      existedInDb = true;
      const updateData = {};
      if (name && name.trim() && (!found.name || found.name === found.email?.split("@")[0])) {
        updateData.name = name.trim();
      }
      if (cleanPhone && (!found.image || found.image.startsWith("phone:"))) {
        updateData.image = `phone:${cleanPhone}`;
      }
      if (!found.emailVerified) {
        updateData.emailVerified = new Date();
      }
      if (isAdmin && found.credits < ADMIN_INITIAL_CREDITS) {
        updateData.credits = ADMIN_INITIAL_CREDITS;
      } else if (!isAdmin && (found.credits === 0 || found.credits < (pkg.credits || 300))) {
        updateData.credits = pkg.credits || 300;
      }
      if (cleanCustomKey !== null && found.customApiKey !== cleanCustomKey) {
        updateData.customApiKey = cleanCustomKey;
      }
      if (Object.keys(updateData).length > 0) {
        found = await prisma.user.update({
          where: { id: found.id },
          data: updateData,
        });
      }
    }
    return found;
  });

  const finalCredits = isAdmin
    ? ADMIN_INITIAL_CREDITS
    : initialCredits !== null
    ? Number(initialCredits)
    : Math.max(
        Number(dbUser?.credits) || 0,
        Number(existingMem?.credits) || 0,
        Number(pkg.credits) || 300
      );

  const storedPhone =
    cleanPhone ||
    (dbUser?.image?.startsWith("phone:") ? dbUser.image.slice(6) : null) ||
    existingMem?.phone ||
    null;

  const userRecord = {
    id:
      dbUser?.id ||
      existingMem?.id ||
      (isAdmin
        ? "admin-obsifem"
        : `buyer-${Buffer.from(cleanEmail).toString("base64url").slice(0, 10)}`),
    name:
      name ||
      dbUser?.name ||
      existingMem?.name ||
      (isAdmin ? "Administrador (UGCore Studio)" : cleanEmail.split("@")[0]),
    email: cleanEmail,
    phone: storedPhone,
    emailVerified: dbUser?.emailVerified
      ? new Date(dbUser.emailVerified).toISOString()
      : existingMem?.emailVerified || new Date().toISOString(),
    role: isAdmin ? "admin" : "buyer",
    isAdmin: Boolean(isAdmin),
    planId: isAdmin ? "admin" : existingMem?.planId || planId,
    planName,
    assignedCredits: Math.max(assignedCredits, finalCredits),
    credits: finalCredits,
    customApiKey:
      cleanCustomKey ?? dbUser?.customApiKey ?? existingMem?.customApiKey ?? null,
    demoClaimed: Boolean(
      existingMem?.demoClaimed || existedInDb || planId === "demo"
    ),
    approved: true,
    updatedAt: new Date().toISOString(),
  };

  runtimeStore.usersByEmail.set(cleanEmail, userRecord);
  return userRecord;
}

export async function safeGetUserCustomApiKey({ userId, email }) {
  const cleanEmail = email ? email.toLowerCase().trim() : null;
  const memUser = cleanEmail ? runtimeStore.usersByEmail.get(cleanEmail) : null;

  const dbUser =
    userId || cleanEmail
      ? await tryDbQuery(() =>
          prisma.user.findFirst({
            where: userId
              ? {
                  OR: [
                    { id: userId },
                    ...(cleanEmail ? [{ email: cleanEmail }] : []),
                  ],
                }
              : { email: cleanEmail },
            select: { customApiKey: true, email: true },
          })
        )
      : null;

  const key = dbUser?.customApiKey ?? memUser?.customApiKey ?? null;
  return typeof key === "string" && key.trim().length > 0 ? key.trim() : null;
}

export async function safeHasClaimedDemo({ userId, email }) {
  const cleanEmail = email ? email.toLowerCase().trim() : null;
  if (!cleanEmail && !userId) return false;
  const memUser = cleanEmail ? runtimeStore.usersByEmail.get(cleanEmail) : null;
  if (memUser?.demoClaimed || (memUser && (memUser.credits > 0 || memUser.assignedCredits > 0))) {
    return true;
  }

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
      select: { id: true },
    })
  );
  return Boolean(dbUser);
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
      const effectiveCredits =
        typeof dbUser.credits === "number" && dbUser.credits > 0
          ? dbUser.credits
          : 300;

      if (dbUser.credits === 0 || dbUser.credits === null) {
        tryDbQuery(() =>
          prisma.user.update({
            where: { id: dbUser.id },
            data: { credits: 300 },
          })
        ).catch(() => {});
      }

      const assigned = Math.max(
        memUser?.assignedCredits || 0,
        effectiveCredits
      );
      const updated = {
        ...(memUser || {}),
        id: dbUser.id,
        email: dbUser.email || cleanEmail,
        name: dbUser.name || memUser?.name || "Usuario Comprador",
        credits: effectiveCredits,
        assignedCredits: assigned || effectiveCredits,
        planId: memUser?.planId || "demo",
        planName: memUser?.planName || "Demo Gratuito",
        approved: true,
      };
      if (updated.email) {
        runtimeStore.usersByEmail.set(updated.email, updated);
      }
      return updated;
    }
  }

  if (memUser) {
    const memCredits =
      typeof memUser.credits === "number" && memUser.credits > 0
        ? memUser.credits
        : 300;
    return {
      ...memUser,
      credits: memCredits,
      assignedCredits: Math.max(memUser.assignedCredits || 0, memCredits),
      planId: memUser.planId || "demo",
      planName: memUser.planName || "Demo Gratuito",
    };
  }

  if (!userId && !cleanEmail) {
    return {
      credits: 300,
      assignedCredits: 300,
      planId: "demo",
      planName: "Demo Gratuito (+300 CR)",
      approved: true,
    };
  }

  return {
    credits: 300,
    assignedCredits: 300,
    planId: "demo",
    planName: "Demo Gratuito",
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

  const storedPhone =
    (dbUser?.image?.startsWith("phone:") ? dbUser.image.slice(6) : null) ||
    existingMem?.phone ||
    null;

  const updatedRecord = {
    id:
      dbUser?.id ||
      existingMem?.id ||
      userId ||
      `buyer-${Buffer.from(cleanEmail).toString("base64url").slice(0, 10)}`,
    name: dbUser?.name || name || existingMem?.name || cleanEmail.split("@")[0],
    email: cleanEmail,
    phone: storedPhone,
    emailVerified: dbUser?.emailVerified
      ? new Date(dbUser.emailVerified).toISOString()
      : existingMem?.emailVerified || new Date().toISOString(),
    role: cleanEmail === "obsifem@gmail.com" ? "admin" : "buyer",
    isAdmin: cleanEmail === "obsifem@gmail.com",
    planId: pkg.id,
    planName: pkg.name,
    assignedCredits: assignedTotal,
    credits: baseCredits,
    customApiKey: existingMem?.customApiKey || null,
    demoClaimed: true,
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
      const targetUser =
        userId && !String(userId).startsWith("buyer-") && userId !== "admin-obsifem"
          ? await prisma.user.findUnique({ where: { id: userId } })
          : cleanEmail
          ? await prisma.user.findUnique({ where: { email: cleanEmail } })
          : null;

      if (targetUser) {
        const nextCredits = Math.max(0, (Number(targetUser.credits) || 0) - cleanAmount);
        await prisma.user.update({
          where: { id: targetUser.id },
          data: { credits: nextCredits },
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
        take: 250,
      });
      for (const dbu of dbUsers) {
        if (!dbu.email) continue;
        const key = dbu.email.toLowerCase().trim();
        const mem = merged.get(key);
        const isAdm = key === "obsifem@gmail.com";
        const dbPhone = dbu.image?.startsWith("phone:")
          ? dbu.image.slice(6)
          : null;
        merged.set(key, {
          id: dbu.id,
          name: dbu.name || mem?.name || key.split("@")[0],
          email: key,
          phone: dbPhone || mem?.phone || null,
          emailVerified: dbu.emailVerified
            ? new Date(dbu.emailVerified).toISOString()
            : mem?.emailVerified || null,
          role: isAdm ? "admin" : "buyer",
          isAdmin: isAdm,
          planId: mem?.planId || (isAdm ? "admin" : dbu.credits > 300 ? "pro" : "demo"),
          planName:
            mem?.planName ||
            (isAdm
              ? "Administrador Master"
              : dbu.credits > 300
              ? "Paquete Comprador"
              : "Demo Gratuito"),
          assignedCredits: isAdm
            ? ADMIN_INITIAL_CREDITS
            : Math.max(mem?.assignedCredits || 0, dbu.credits || 0),
          credits: isAdm ? ADMIN_INITIAL_CREDITS : dbu.credits ?? 0,
          approved: true,
          updatedAt:
            mem?.updatedAt ||
            (dbu.emailVerified
              ? new Date(dbu.emailVerified).toISOString()
              : new Date().toISOString()),
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
  status = "processing",
  url = null,
}) {
  const isMultiSegment = requestIds.length > 1;
  const serializedRequestId = isMultiSegment
    ? JSON.stringify(requestIds)
    : requestIds[0];
  const initialUrl =
    url !== null
      ? url
      : isMultiSegment
      ? JSON.stringify(new Array(requestIds.length).fill(null))
      : null;
  const statelessId = encodeStatelessCreationId(requestIds, modelId);

  const fallbackCreation = {
    id: statelessId,
    userId: userId || "anon",
    userEmail: userEmail ? userEmail.toLowerCase().trim() : null,
    type: "video",
    title: (prompt || "UGCore Video").substring(0, 50) + "...",
    prompt: prompt || "",
    requestId: serializedRequestId,
    url: initialUrl,
    status,
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
    if (prisma?.creation && prisma?.user && (userEmail || userId)) {
      let validDbUserId = userId;
      const cleanEmail = (userEmail || "")
        .toLowerCase()
        .trim();

      if (cleanEmail) {
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
              cleanEmail === "obsifem@gmail.com" ? ADMIN_INITIAL_CREDITS : 300,
          },
        });
        validDbUserId = dbUser.id;
      }

      if (validDbUserId) {
        const dbCreation = await prisma.creation.create({
          data: {
            userId: validDbUserId,
            type: "video",
            title: fallbackCreation.title,
            prompt: fallbackCreation.prompt,
            requestId: serializedRequestId,
            url: initialUrl,
            status,
            modelId,
            aspectRatio: aspectRatio || null,
            resolution: resolution || null,
            duration: duration || null,
            mode: mode || null,
            inputImages: fallbackCreation.inputImages,
          },
        });

        runtimeStore.creationsById.set(dbCreation.id, dbCreation);
        // Remove transient stateless token so the exact same video is never duplicated in gallery
        if (statelessId !== dbCreation.id) {
          runtimeStore.creationsById.delete(statelessId);
        }
        return dbCreation;
      }
    }
  } catch (err) {
    console.warn(
      "[SAFE_CREATE_CREATION_FALLBACK] Using stateless creation token:",
      err?.message || err
    );
  }

  return fallbackCreation;
}

