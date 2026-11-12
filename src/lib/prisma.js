import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;

const DATABASE_CONNECTION_URL =
  process.env.DATABASE_URL || process.env.DIRECT_URL || "";

let prismaInstance = globalForPrisma.prisma;

if (!prismaInstance) {
  if (!DATABASE_CONNECTION_URL) {
    prismaInstance = {};
  } else {
    try {
      const pool = new Pool({
        connectionString: DATABASE_CONNECTION_URL,
        connectionTimeoutMillis: 1500,
        idleTimeoutMillis: 5000,
        max: 3,
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
