/* Guarded Prisma singleton. The platform runs fully without a database
   (localStorage fallback); persistence activates when DATABASE_URL is a
   real connection string. */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const dbConfigured = (): boolean => {
  const url = process.env.DATABASE_URL || "";
  return url.startsWith("postgres") && !url.includes("user:password@localhost");
};

export const db = (): PrismaClient | null => {
  if (!dbConfigured()) return null;
  if (!globalForPrisma.prisma) globalForPrisma.prisma = new PrismaClient();
  return globalForPrisma.prisma;
};
