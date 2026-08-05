import { PrismaClient } from "@prisma/client";

// Standard Next.js dev-mode singleton to avoid exhausting DB connections
// on hot reload. Used by src/lib/products.ts and src/lib/coaches.ts —
// requires DATABASE_URL (and DIRECT_URL for migrations) in .env,
// pointing at your Supabase project. See README.md for setup.

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
