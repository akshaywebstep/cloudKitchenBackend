import "dotenv/config";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient, Prisma } from '../prisma/generated/prisma/client';
import debugHelper from "../src/core/helpers/debug";
import {
  DB_ENV,
  getDatabaseEnv,
  getDatabaseHost,
  getDatabaseName,
  getDatabasePort
} from "../src/core/config/databaseEnv";

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

const envNumber = (key: string, fallback: number) => {
  const value = Number(getDatabaseEnv(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const adapter = new PrismaMariaDb({
  host: getDatabaseHost(),
  port: getDatabasePort(),
  user: getDatabaseEnv('DATABASE_USER'),
  password: getDatabaseEnv('DATABASE_PASSWORD'),
  database: getDatabaseName(),
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
  debugHelper.debug("Database:", getDatabaseName(), `(env=${DB_ENV})`);
  debugHelper.debug("Host:", `${getDatabaseHost()}:${getDatabasePort()}`);
  debugHelper.debug("🐛 Query Logs:", PRISMA_QUERY_LOG);
}

/* -------------------------------- */

export { prisma, Prisma };
