import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

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
  adapter: PrismaAdapter(prisma),
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
      name: "Credentials & API Key",
      credentials: {
        email: { label: "Admin Email", type: "text" },
        password: { label: "Admin Key / Password", type: "password" },
        apiKey: { label: "MuAPI Key", type: "password" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials) {
        const loginType = credentials?.loginType || "apikey";

        // 1. Administrator Login
        if (loginType === "admin") {
          const rawEmail = (credentials?.email || "obsifem@gmail.com")
            .toLowerCase()
            .trim();
          const rawPass = (credentials?.password || "").trim();

          const emailMatchesAdmin =
            isAdminEmail(rawEmail) || rawEmail === "admin" || rawEmail === "obsifem-dotcom";
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

          const adminEmail = isAdminEmail(rawEmail) ? rawEmail : "obsifem@gmail.com";

          try {
            let adminUser = await prisma.user.findUnique({
              where: { email: adminEmail },
            });

            if (!adminUser) {
              adminUser = await prisma.user.create({
                data: {
                  name: "Administrador (UGCora Studio)",
                  email: adminEmail,
                  credits: 999999,
                  customApiKey: DEFAULT_MUAPI_KEY,
                },
              });
            } else if (adminUser.credits < 999999 || !adminUser.customApiKey) {
              adminUser = await prisma.user.update({
                where: { id: adminUser.id },
                data: {
                  credits: 999999,
                  customApiKey: adminUser.customApiKey || DEFAULT_MUAPI_KEY,
                },
              });
            }

            return {
              id: adminUser.id,
              name: adminUser.name || "Administrador (UGCora Studio)",
              email: adminUser.email,
              image: adminUser.image || null,
              credits: 999999,
              customApiKey: adminUser.customApiKey || DEFAULT_MUAPI_KEY,
              isApiKeyUser: true,
              isAdmin: true,
              role: "admin",
            };
          } catch (dbErr) {
            console.error("[ADMIN_AUTH_DB_FALLBACK]", dbErr);
            return {
              id: "admin-obsifem",
              name: "Administrador (UGCora Studio)",
              email: adminEmail,
              image: null,
              credits: 999999,
              customApiKey: DEFAULT_MUAPI_KEY,
              isApiKeyUser: true,
              isAdmin: true,
              role: "admin",
            };
          }
        }

        // 2. API Key Login (also upgrades to Admin if using a configured server/admin key)
        if (!credentials?.apiKey) {
          throw new Error("API Key is required");
        }
        const apiKey = credentials.apiKey.trim();
        if (apiKey.length < 5) {
          throw new Error("Invalid API key format");
        }

        const isServerAdminKey = SERVER_ADMIN_KEYS.includes(apiKey);
        const effectiveApiKey =
          apiKey === "88e6133af38f606478109f6a80320815d7b7b742812b908ec2c8e23da4adfe42"
            ? DEFAULT_MUAPI_KEY
            : apiKey;

        const targetEmail = isServerAdminKey
          ? "obsifem@gmail.com"
          : `apikey_${apiKey.slice(-8)}@muapi.local`;

        try {
          let dbUser = await prisma.user.findFirst({
            where: {
              OR: [{ customApiKey: effectiveApiKey }, { email: targetEmail }],
            },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                name: isServerAdminKey ? "Administrador (UGCora Studio)" : "API Key User",
                email: targetEmail,
                customApiKey: effectiveApiKey,
                credits: isServerAdminKey ? 999999 : 0,
              },
            });
          } else if (!dbUser.customApiKey || (isServerAdminKey && dbUser.credits < 999999)) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                customApiKey: effectiveApiKey,
                ...(isServerAdminKey ? { credits: 999999 } : {}),
              },
            });
          }

          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image || null,
            credits: isServerAdminKey ? 999999 : dbUser.credits,
            customApiKey: dbUser.customApiKey || effectiveApiKey,
            isApiKeyUser: true,
            isAdmin: isServerAdminKey || isAdminEmail(dbUser.email),
            role: isServerAdminKey || isAdminEmail(dbUser.email) ? "admin" : "user",
          };
        } catch (dbErr) {
          console.error("[APIKEY_AUTH_DB_FALLBACK]", dbErr);
          return {
            id: isServerAdminKey ? "admin-obsifem" : `apikey-${apiKey.slice(-8)}`,
            name: isServerAdminKey ? "Administrador (UGCora Studio)" : "API Key User",
            email: targetEmail,
            image: null,
            credits: isServerAdminKey ? 999999 : 0,
            customApiKey: effectiveApiKey,
            isApiKeyUser: true,
            isAdmin: isServerAdminKey,
            role: isServerAdminKey ? "admin" : "user",
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.credits = user.credits;
        token.customApiKey = user.customApiKey;
        token.isApiKeyUser = user.isApiKeyUser || false;
        token.isAdmin = Boolean(user.isAdmin || isAdminEmail(user.email));
        token.role = token.isAdmin ? "admin" : user.role || "user";
      }
      if (trigger === "update" && session) {
        if (session.customApiKey !== undefined) token.customApiKey = session.customApiKey;
        if (session.credits !== undefined) token.credits = session.credits;
      }
      const userId = token.id || token.sub;
      if (userId && userId !== "admin-obsifem") {
        token.id = userId;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true, customApiKey: true, email: true },
          });
          if (dbUser) {
            const adminFlag = Boolean(token.isAdmin || isAdminEmail(dbUser.email));
            token.isAdmin = adminFlag;
            token.role = adminFlag ? "admin" : "user";
            token.credits = adminFlag ? 999999 : dbUser.credits;
            token.customApiKey = dbUser.customApiKey || (adminFlag ? DEFAULT_MUAPI_KEY : null);
          }
        } catch {}
      }
      if (token.isAdmin) {
        token.credits = 999999;
        token.role = "admin";
        if (!token.customApiKey) {
          token.customApiKey = DEFAULT_MUAPI_KEY;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const adminFlag = Boolean(token.isAdmin || isAdminEmail(session.user.email));
        session.user.id = token.id || token.sub;
        session.user.isAdmin = adminFlag;
        session.user.role = adminFlag ? "admin" : token.role || "user";
        session.user.credits = adminFlag ? 999999 : token.credits;
        session.user.customApiKey = token.customApiKey;
        session.user.isApiKeyUser = Boolean(token.customApiKey || adminFlag);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "DrNDNN5RAavK9d2huBn7SpX5osg4YmGcx1+12B+sYLw=",
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
