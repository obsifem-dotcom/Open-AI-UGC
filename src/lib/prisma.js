import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  "postgresql://postgres.xlandgxujchkfshybicy:K65FZuJ4bhCRaCwD@aws-0-ca-central-1.pooler.supabase.com:5432/postgres";

let prismaInstance = globalForPrisma.prisma;

if (!prismaInstance) {
  try {
    const pool = new Pool({
      connectionString: DEFAULT_DATABASE_URL,
      connectionTimeoutMillis: 4000,
      idleTimeoutMillis: 10000,
      max: 5,
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

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
