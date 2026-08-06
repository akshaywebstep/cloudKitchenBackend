import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from '../prisma/generated/prisma/client';
import debugHelper from "../src/core/helpers/debug";

/* -------------------------------- */
/* ENV VARIABLES */
/* -------------------------------- */

const DB_ENV = process.env.DB_ENV || "local";
const connectionString = DB_ENV === "live"
  ? (process.env.LIVE_DATABASE_URL ?? process.env.DATABASE_URL)
  : process.env.DATABASE_URL;
const APP_DEBUG = process.env.APP_DEBUG === "true";
const PRISMA_QUERY_LOG = process.env.PRISMA_QUERY_LOG === "true";

/* -------------------------------- */
/* GLOBAL TYPE */
/* -------------------------------- */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/* -------------------------------- */
/* DATABASE ADAPTER */
/* -------------------------------- */

const adapter = new PrismaPg({ connectionString });

/* -------------------------------- */
/* PRISMA CLIENT SINGLETON */
/* -------------------------------- */

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,

    log: PRISMA_QUERY_LOG
      ? ["query", "info", "warn", "error"]
      : ["error"],
  });

/* -------------------------------- */
/* STORE IN GLOBAL (DEV ONLY) */
/* -------------------------------- */

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/* -------------------------------- */
/* DEBUG LOG */
/* -------------------------------- */

if (APP_DEBUG) {
  debugHelper.debug("🚀 Prisma Client Initialized");
  debugHelper.debug("📦 Connection var:", DB_ENV === "live" ? 'LIVE_DATABASE_URL' : 'DATABASE_URL');
  debugHelper.debug("📦 DB_ENV:", DB_ENV);
  debugHelper.debug("🐛 Query Logs:", PRISMA_QUERY_LOG);
}

/* -------------------------------- */

export { prisma, Prisma };