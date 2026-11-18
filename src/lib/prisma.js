import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;

const FALLBACK_DATABASE_URL =
  "postgresql://postgres.xlandgxujchkfshybicy:K65FZuJ4bhCRaCwD@aws-0-ca-central-1.pooler.supabase.com:5432/postgres";

const DATABASE_CONNECTION_URL = (
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  FALLBACK_DATABASE_URL
).trim();

let prismaInstance = globalForPrisma.prisma;

if (!prismaInstance) {
  if (!DATABASE_CONNECTION_URL) {
    prismaInstance = {};
  } else {
    try {
      const pool = new Pool({
        connectionString: DATABASE_CONNECTION_URL,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 10000,
        max: 10,
        ssl: { rejectUnauthorized: false },
      });
      pool.on("error", (err) => {
        console.warn("[PRISMA_POOL_WARN]", err?.message || err);
      });
      const adapter = new PrismaPg(pool);
      prismaInstance = new PrismaClient({
        adapter,
        log: ["error"],
      });
    } catch (err) {
      console.warn("[PRISMA_INIT_FALLBACK]", err?.message || err);
      prismaInstance = {};
    }
  }
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
