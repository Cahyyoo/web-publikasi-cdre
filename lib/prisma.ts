import { PrismaClient } from "@prisma/client";

// Prevent multiple PrismaClient instances in dev (Next.js hot-reload
// recreates modules on every edit, which would otherwise exhaust the
// MySQL connection pool).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
