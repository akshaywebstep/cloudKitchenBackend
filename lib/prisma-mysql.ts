import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, Prisma } from '../prisma/generated/prisma/client';
import debugHelper from "../src/core/helpers/debug";

/* -------------------------------- */
/* ENV VARIABLES */
/* -------------------------------- */

const APP_DEBUG = process.env.APP_DEBUG === "true";
const PRISMA_QUERY_LOG = process.env.PRISMA_QUERY_LOG === "true";

/* -------------------------------- */
/* GLOBAL TYPE */
/* -------------------------------- */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/* -------------------------------- */
/* DATABASE ADAPTER (supports DB_ENV/live) */
/* -------------------------------- */

const hasLiveDatabaseEnv = Boolean(
  process.env.LIVE_DATABASE_HOST ||
  process.env.LIVE_DATABASE_NAME ||
  process.env.LIVE_DATABASE_USER
);
const DB_ENV = process.env.DB_ENV || (hasLiveDatabaseEnv ? "live" : "local");
const isLive = DB_ENV === "live";
const env = (key: string) => process.env[isLive ? `LIVE_${key}` : key] ?? process.env[key];
const envNumber = (key: string, fallback: number) => {
  const value = Number(env(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const adapter = new PrismaMariaDb({
  host: env('DATABASE_HOST'),
  port: envNumber('DATABASE_PORT', 3306),
  user: env('DATABASE_USER'),
  password: env('DATABASE_PASSWORD'),
  database: env('DATABASE_NAME'),
  connectTimeout: envNumber('DATABASE_CONNECT_TIMEOUT', 15000),
  acquireTimeout: envNumber('DATABASE_ACQUIRE_TIMEOUT', envNumber('DATABASE_CONNECT_TIMEOUT', 15000)),
  queryTimeout: envNumber('DATABASE_QUERY_TIMEOUT', 30000),
  connectionLimit: envNumber('DATABASE_CONNECTION_LIMIT', 5)
});

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
  debugHelper.debug("🚀 Prisma Client Initialized");
  debugHelper.debug("📦 Database:", env('DATABASE_NAME'), `(env=${DB_ENV})`);
  debugHelper.debug("🔗 Host:", env('DATABASE_HOST'));
  debugHelper.debug("🐛 Query Logs:", PRISMA_QUERY_LOG);
}

/* -------------------------------- */

export { prisma, Prisma };
