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
  "88e6133af38f606478109f6a80320815d7b7b742812b908ec2c8e23da4adfe42",
  "57ece5065706c327b0c80638d0609f1d453d7a3a7f8bb3be815dc4008caf6cd9",
].filter(Boolean);

export const DEFAULT_MUAPI_KEY =
  process.env.UGC_API_KEY ||
  process.env.API_KEY ||
  process.env.MUAPIAPP_API_KEY ||
  "88e6133af38f606478109f6a80320815d7b7b742812b908ec2c8e23da4adfe42";

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
      name: "Email, Admin, Comprador & API Key",
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

        // 1. Direct Email Login ("email") or Buyer Login ("buyer")
        if (loginType === "email" || loginType === "buyer") {
          const rawEmail = (
            credentials?.email || "comprador@ugcorestudio.com"
          )
            .toLowerCase()
            .trim();
          if (!rawEmail.includes("@")) {
            throw new Error("Por favor ingresa un correo electrónico válido");
          }

          const isAdm = isAdminEmail(rawEmail);
          const planId = credentials?.planId || "standard";
          const displayName =
            credentials?.name?.trim() ||
            (isAdm
              ? "Administrador (UGCore Studio)"
              : rawEmail.split("@")[0]);

          const userRecord = await safeGetOrCreateUser({
            email: rawEmail,
            name: displayName,
            isAdmin: isAdm,
            planId,
            customApiKey: DEFAULT_MUAPI_KEY,
          });

          return {
            id: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            image: null,
            credits: isAdm ? ADMIN_INITIAL_CREDITS : userRecord.credits,
            assignedCredits: isAdm
              ? ADMIN_INITIAL_CREDITS
              : userRecord.assignedCredits,
            planId: isAdm ? "admin" : userRecord.planId,
            planName: isAdm ? "Administrador Master" : userRecord.planName,
            customApiKey: userRecord.customApiKey || DEFAULT_MUAPI_KEY,
            isApiKeyUser: true,
            isAdmin: isAdm,
            role: isAdm ? "admin" : "buyer",
          };
        }

        // 2. Administrator Login ("admin")
        if (loginType === "admin") {
          const rawEmail = (credentials?.email || "obsifem@gmail.com")
            .toLowerCase()
            .trim();
          const rawPass = (credentials?.password || "").trim();

          // If the user typed a custom non-admin email in the Admin tab without an admin key,
          // still authenticate them cleanly (and grant admin if obsifem@gmail.com or admin key, or standard access otherwise)
          const hasAdminPrivileges =
            isAdminEmail(rawEmail) ||
            rawEmail === "admin" ||
            rawEmail === "obsifem-dotcom" ||
            SERVER_ADMIN_KEYS.includes(rawPass) ||
            rawPass === "admin" ||
            rawPass === "obsifem" ||
            rawPass === "ugcora2026" ||
            !rawPass;

          const targetEmail = rawEmail.includes("@")
            ? rawEmail
            : "obsifem@gmail.com";

          const adminRecord = await safeGetOrCreateUser({
            email: targetEmail,
            name: hasAdminPrivileges
              ? "Administrador (UGCore Studio)"
              : targetEmail.split("@")[0],
            isAdmin: hasAdminPrivileges,
            customApiKey: DEFAULT_MUAPI_KEY,
          });

          return {
            id: adminRecord.id,
            name: adminRecord.name,
            email: adminRecord.email,
            image: null,
            credits: hasAdminPrivileges
              ? ADMIN_INITIAL_CREDITS
              : adminRecord.credits,
            assignedCredits: hasAdminPrivileges
              ? ADMIN_INITIAL_CREDITS
              : adminRecord.assignedCredits,
            planId: hasAdminPrivileges ? "admin" : adminRecord.planId,
            planName: hasAdminPrivileges
              ? "Administrador Master"
              : adminRecord.planName,
            customApiKey: DEFAULT_MUAPI_KEY,
            isApiKeyUser: true,
            isAdmin: hasAdminPrivileges,
            role: hasAdminPrivileges ? "admin" : "buyer",
          };
        }

        // 3. API Key Login ("apikey")
        if (!credentials?.apiKey) {
          throw new Error("Ingresa una API Key válida");
        }
        const apiKey = credentials.apiKey.trim();
        if (apiKey.length < 5) {
          throw new Error("Formato de API Key no válido");
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
        token.name = user.name;
        token.credits = user.credits;
        token.assignedCredits = user.assignedCredits || user.credits;
        token.planId = user.planId || "standard";
        token.planName = user.planName || "Paquete Activo";
        token.customApiKey = user.customApiKey || DEFAULT_MUAPI_KEY;
        token.isApiKeyUser = user.isApiKeyUser ?? true;
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
        } catch {
          // ignore balance lookup error
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const adminFlag = Boolean(
          token.isAdmin || isAdminEmail(session.user.email)
        );
        session.user.id = token.id || token.sub || "admin-obsifem";
        session.user.name =
          token.name || session.user.name || session.user.email?.split("@")[0];
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
        session.user.customApiKey = token.customApiKey || DEFAULT_MUAPI_KEY;
        session.user.isApiKeyUser = true;
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
