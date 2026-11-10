import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
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
  "88e6133af38f606478109f6a80320815d7b7b742812b908ec2c8e23da4adfe42",
  "57ece5065706c327b0c80638d0609f1d453d7a3a7f8bb3be815dc4008caf6cd9",
].filter(Boolean);

export const DEFAULT_MUAPI_KEY =
  process.env.UGC_API_KEY ||
  process.env.MUAPIAPP_API_KEY ||
  "57ece5065706c327b0c80638d0609f1d453d7a3a7f8bb3be815dc4008caf6cd9";

export function isAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export const authOptions = {
  adapter: prisma?.user ? PrismaAdapter(prisma) : undefined,
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
      name: "Credentials & Access",
      credentials: {
        email: { label: "Email", type: "text" },
        name: { label: "Name", type: "text" },
        password: { label: "Password / Key", type: "password" },
        apiKey: { label: "MuAPI Key", type: "password" },
        planId: { label: "Plan ID", type: "text" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials) {
        const loginType = credentials?.loginType || "admin";

        // 1. Administrator Login
        if (loginType === "admin") {
          const rawEmail = (credentials?.email || "obsifem@gmail.com")
            .toLowerCase()
            .trim();
          const rawPass = (credentials?.password || "").trim();

          const emailMatchesAdmin =
            isAdminEmail(rawEmail) ||
            rawEmail === "admin" ||
            rawEmail === "obsifem-dotcom";
          const passMatchesAdmin =
            !rawPass ||
            SERVER_ADMIN_KEYS.includes(rawPass) ||
            rawPass === "admin" ||
            rawPass === "obsifem" ||
            rawPass === "ugcora2026";

          if (!emailMatchesAdmin && !SERVER_ADMIN_KEYS.includes(rawPass)) {
            throw new Error("Credenciales de administrador no válidas");
          }
          if (!passMatchesAdmin) {
            throw new Error("Clave de administrador incorrecta");
          }

          const adminEmail = isAdminEmail(rawEmail)
            ? rawEmail
            : "obsifem@gmail.com";

          const adminRecord = await safeGetOrCreateUser({
            email: adminEmail,
            name: "Administrador (UGCore Studio)",
            isAdmin: true,
            customApiKey: DEFAULT_MUAPI_KEY,
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
            customApiKey: DEFAULT_MUAPI_KEY,
            isApiKeyUser: true,
            isAdmin: true,
            role: "admin",
          };
        }

        // 2. Buyer / Comprador Login (shows assigned credits from purchase)
        if (loginType === "buyer") {
          const rawEmail = (
            credentials?.email || "comprador@ugcorestudio.com"
          )
            .toLowerCase()
            .trim();
          if (!rawEmail.includes("@")) {
            throw new Error("Ingresa un correo electrónico válido");
          }

          const isAdm = isAdminEmail(rawEmail);
          const planId = credentials?.planId || "pro";
          const buyerRecord = await safeGetOrCreateUser({
            email: rawEmail,
            name: credentials?.name || rawEmail.split("@")[0],
            isAdmin: isAdm,
            planId,
          });

          return {
            id: buyerRecord.id,
            name: buyerRecord.name,
            email: buyerRecord.email,
            image: null,
            credits: buyerRecord.credits,
            assignedCredits: buyerRecord.assignedCredits,
            planId: buyerRecord.planId,
            planName: buyerRecord.planName,
            customApiKey: isAdm ? DEFAULT_MUAPI_KEY : buyerRecord.customApiKey,
            isApiKeyUser: Boolean(isAdm || buyerRecord.customApiKey),
            isAdmin: isAdm,
            role: isAdm ? "admin" : "buyer",
          };
        }

        // 3. API Key Login
        if (!credentials?.apiKey) {
          throw new Error("API Key is required");
        }
        const apiKey = credentials.apiKey.trim();
        if (apiKey.length < 5) {
          throw new Error("Invalid API key format");
        }

        const isServerAdminKey = SERVER_ADMIN_KEYS.includes(apiKey);
        const effectiveApiKey =
          apiKey ===
          "88e6133af38f606478109f6a80320815d7b7b742812b908ec2c8e23da4adfe42"
            ? DEFAULT_MUAPI_KEY
            : apiKey;

        const targetEmail = isServerAdminKey
          ? "obsifem@gmail.com"
          : `apikey_${apiKey.slice(-8)}@muapi.local`;

        const keyUser = await safeGetOrCreateUser({
          email: targetEmail,
          name: isServerAdminKey
            ? "Administrador (UGCore Studio)"
            : "API Key User",
          isAdmin: isServerAdminKey,
          initialCredits: isServerAdminKey ? ADMIN_INITIAL_CREDITS : 1000,
          customApiKey: effectiveApiKey,
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
          planId: keyUser.planId,
          planName: keyUser.planName,
          customApiKey: effectiveApiKey,
          isApiKeyUser: true,
          isAdmin: isServerAdminKey || isAdminEmail(keyUser.email),
          role:
            isServerAdminKey || isAdminEmail(keyUser.email) ? "admin" : "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.credits = user.credits;
        token.assignedCredits = user.assignedCredits || user.credits;
        token.planId = user.planId || "standard";
        token.planName = user.planName || "Paquete Activo";
        token.customApiKey = user.customApiKey;
        token.isApiKeyUser = user.isApiKeyUser || false;
        token.isAdmin = Boolean(user.isAdmin || isAdminEmail(user.email));
        token.role = token.isAdmin ? "admin" : user.role || "buyer";
      }
      if (trigger === "update" && session) {
        if (session.customApiKey !== undefined)
          token.customApiKey = session.customApiKey;
        if (session.credits !== undefined) token.credits = session.credits;
        if (session.assignedCredits !== undefined)
          token.assignedCredits = session.assignedCredits;
        if (session.planName !== undefined) token.planName = session.planName;
        if (session.planId !== undefined) token.planId = session.planId;
      }

      const userId = token.id || token.sub;
      const userEmail = token.email;
      const adminFlag = Boolean(token.isAdmin || isAdminEmail(userEmail));

      if (adminFlag) {
        token.isAdmin = true;
        token.role = "admin";
        token.credits = ADMIN_INITIAL_CREDITS;
        token.assignedCredits = ADMIN_INITIAL_CREDITS;
        token.planName = "Administrador Master";
        if (!token.customApiKey) {
          token.customApiKey = DEFAULT_MUAPI_KEY;
        }
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
            token.planName = bal.planName || token.planName || "Paquete Activo";
          }
        } catch {}
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const adminFlag = Boolean(
          token.isAdmin || isAdminEmail(session.user.email)
        );
        session.user.id = token.id || token.sub || "admin-obsifem";
        session.user.isAdmin = adminFlag;
        session.user.role = adminFlag ? "admin" : token.role || "buyer";
        session.user.credits = adminFlag
          ? ADMIN_INITIAL_CREDITS
          : token.credits ?? 1000;
        session.user.assignedCredits = adminFlag
          ? ADMIN_INITIAL_CREDITS
          : token.assignedCredits ?? session.user.credits;
        session.user.planId = adminFlag ? "admin" : token.planId || "standard";
        session.user.planName = adminFlag
          ? "Administrador Master"
          : token.planName || "Paquete Comprador";
        session.user.customApiKey = token.customApiKey;
        session.user.isApiKeyUser = Boolean(token.customApiKey || adminFlag);
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "DrNDNN5RAavK9d2huBn7SpX5osg4YmGcx1+12B+sYLw=",
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
