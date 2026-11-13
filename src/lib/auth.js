import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  ADMIN_INITIAL_CREDITS,
  safeGetOrCreateUser,
  safeGetUserBalance,
} from "./runtime-store";

const ADMIN_EMAILS = [
  "obsifem@gmail.com",
  "admin@ugcora.studio",
  "admin@ugcorestudio.com",
  process.env.ADMIN_EMAIL,
]
  .filter(Boolean)
  .map((e) => e.toLowerCase().trim());

const SERVER_ADMIN_KEYS = [
  process.env.ADMIN_PASSWORD,
  process.env.ADMIN_KEY,
  process.env.API_KEY,
  process.env.UGC_API_KEY,
  process.env.MUAPIAPP_API_KEY,
]
  .map((k) => (typeof k === "string" ? k.trim() : ""))
  .filter(Boolean);

export const DEFAULT_MUAPI_KEY = (
  process.env.UGC_API_KEY ||
  process.env.API_KEY ||
  process.env.MUAPIAPP_API_KEY ||
  ""
).trim();

export function isServerMasterKey(key) {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  return (
    trimmed === DEFAULT_MUAPI_KEY || SERVER_ADMIN_KEYS.includes(trimmed)
  );
}

export function isAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: "credentials",
      name: "Email, Demo & API Key",
      credentials: {
        email: { label: "Email", type: "text" },
        name: { label: "Name", type: "text" },
        password: { label: "Password / Key", type: "password" },
        apiKey: { label: "MuAPI Key", type: "password" },
        planId: { label: "Plan ID", type: "text" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials) {
        const loginType = (credentials?.loginType || "email").trim();

        // 1. Direct Email / Demo User Login ("email" or "buyer")
        if (loginType === "email" || loginType === "buyer") {
          const rawEmail = (credentials?.email || "").toLowerCase().trim();
          if (!rawEmail || !rawEmail.includes("@")) {
            throw new Error("Por favor ingresa un correo electrónico válido");
          }

          if (isAdminEmail(rawEmail)) {
            throw new Error(
              "Esta cuenta es de Administrador. Ingresa desde la pestaña Admin con tu contraseña maestra."
            );
          }

          const displayName =
            credentials?.name?.trim() || rawEmail.split("@")[0];

          // Public users start strictly on the free demo tier (300 CR) unless they already have a balance/plan
          const userRecord = await safeGetOrCreateUser({
            email: rawEmail,
            name: displayName,
            isAdmin: false,
            planId: "demo",
            customApiKey: null,
          });

          const userByokKey =
            userRecord.customApiKey && !isServerMasterKey(userRecord.customApiKey)
              ? userRecord.customApiKey
              : null;

          return {
            id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            image: null,
            credits: userRecord.credits,
            assignedCredits: userRecord.assignedCredits,
            planId: userRecord.planId || "demo",
            planName: userRecord.planName || "Demo Gratuito",
            hasCustomApiKey: Boolean(userByokKey),
            isAdmin: false,
            role: "buyer",
          };
        }

        // 2. Administrator Login ("admin") — requires verified server admin key/password
        if (loginType === "admin") {
          const rawEmail = (credentials?.email || "obsifem@gmail.com")
            .toLowerCase()
            .trim();
          const rawPass = (credentials?.password || "").trim();

          if (SERVER_ADMIN_KEYS.length === 0) {
            throw new Error(
              "No hay ADMIN_PASSWORD o UGC_API_KEY configurada en el servidor."
            );
          }

          if (!rawPass || !SERVER_ADMIN_KEYS.includes(rawPass)) {
            throw new Error(
              "Contraseña o clave maestra de Administrador incorrecta."
            );
          }

          if (!isAdminEmail(rawEmail)) {
            throw new Error("Este correo no está autorizado como Administrador.");
          }

          const adminRecord = await safeGetOrCreateUser({
            email: rawEmail,
            name: "Administrador (UGCore Studio)",
            isAdmin: true,
            customApiKey: null,
          });

          return {
            id: adminRecord.id,
            name: adminRecord.name,
            email: adminRecord.email,
            image: null,
            credits: ADMIN_INITIAL_CREDITS,
            assignedCredits: ADMIN_INITIAL_CREDITS,
            planId: "admin",
            planName: "Administrador Master",
            hasCustomApiKey: false,
            isAdmin: true,
            role: "admin",
          };
        }

        // 3. API Key Login ("apikey")
        if (!credentials?.apiKey) {
          throw new Error("Ingresa una API Key válida");
        }
        const apiKey = credentials.apiKey.trim();
        if (apiKey.length < 10) {
          throw new Error("Formato de API Key no válido");
        }

        const isServerAdminKey = SERVER_ADMIN_KEYS.includes(apiKey);
        const targetEmail = isServerAdminKey
          ? "obsifem@gmail.com"
          : `apikey_${apiKey.slice(-8)}@muapi.local`;

        const keyUser = await safeGetOrCreateUser({
          email: targetEmail,
          name: isServerAdminKey
            ? "Administrador (UGCore Studio)"
            : "Usuario BYOK (API Key Propia)",
          isAdmin: isServerAdminKey,
          planId: isServerAdminKey ? "admin" : "demo",
          initialCredits: isServerAdminKey ? ADMIN_INITIAL_CREDITS : 300,
          customApiKey: isServerAdminKey ? null : apiKey,
        });

        return {
          id: keyUser.id,
          name: keyUser.name,
          email: keyUser.email,
          image: null,
          credits: isServerAdminKey ? ADMIN_INITIAL_CREDITS : keyUser.credits,
          assignedCredits: isServerAdminKey
            ? ADMIN_INITIAL_CREDITS
            : keyUser.assignedCredits,
          planId: isServerAdminKey ? "admin" : keyUser.planId,
          planName: isServerAdminKey ? "Administrador Master" : "BYOK (API Key Propia)",
          hasCustomApiKey: !isServerAdminKey,
          isAdmin: isServerAdminKey,
          role: isServerAdminKey ? "admin" : "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.credits = user.credits;
        token.assignedCredits = user.assignedCredits || user.credits;
        token.planId = user.planId || "demo";
        token.planName = user.planName || "Demo Gratuito";
        token.hasCustomApiKey = Boolean(user.hasCustomApiKey);
        token.isAdmin = Boolean(user.isAdmin);
        token.role = token.isAdmin ? "admin" : user.role || "buyer";
      }
      if (trigger === "update" && session) {
        if (session.hasCustomApiKey !== undefined)
          token.hasCustomApiKey = Boolean(session.hasCustomApiKey);
        if (session.credits !== undefined) token.credits = session.credits;
        if (session.assignedCredits !== undefined)
          token.assignedCredits = session.assignedCredits;
        if (session.planName !== undefined) token.planName = session.planName;
        if (session.planId !== undefined) token.planId = session.planId;
      }

      const userId = token.id || token.sub;
      const userEmail = token.email;
      const adminFlag = Boolean(token.isAdmin);

      if (adminFlag) {
        token.isAdmin = true;
        token.role = "admin";
        token.credits = ADMIN_INITIAL_CREDITS;
        token.assignedCredits = ADMIN_INITIAL_CREDITS;
        token.planId = "admin";
        token.planName = "Administrador Master";
      } else if (userId || userEmail) {
        try {
          const bal = await safeGetUserBalance({
            userId,
            email: userEmail,
            isAdmin: false,
          });
          if (bal && typeof bal.credits === "number") {
            token.credits = bal.credits;
            token.assignedCredits = bal.assignedCredits || bal.credits;
            token.planId = bal.planId || token.planId || "demo";
            token.planName = bal.planName || token.planName || "Demo Gratuito";
            if (bal.customApiKey !== undefined) {
              token.hasCustomApiKey = Boolean(
                bal.customApiKey && !isServerMasterKey(bal.customApiKey)
              );
            }
          }
        } catch {
          // ignore balance lookup error
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const adminFlag = Boolean(token.isAdmin);
        session.user.id = token.id || token.sub;
        session.user.name =
          token.name || session.user.name || session.user.email?.split("@")[0];
        session.user.isAdmin = adminFlag;
        session.user.role = adminFlag ? "admin" : token.role || "buyer";
        session.user.credits = adminFlag
          ? ADMIN_INITIAL_CREDITS
          : token.credits ?? 300;
        session.user.assignedCredits = adminFlag
          ? ADMIN_INITIAL_CREDITS
          : token.assignedCredits ?? session.user.credits;
        session.user.planId = adminFlag ? "admin" : token.planId || "demo";
        session.user.planName = adminFlag
          ? "Administrador Master"
          : token.planName || "Demo Gratuito";
        session.user.hasCustomApiKey = Boolean(token.hasCustomApiKey);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
