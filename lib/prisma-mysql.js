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
const globalForPrisma = globalThis;
/* -------------------------------- */
/* DATABASE ADAPTER (supports DB_ENV/live) */
/* -------------------------------- */
const DB_ENV = process.env.DB_ENV || "local";
const isLive = DB_ENV === "live";
const env = (key) => process.env[isLive ? `LIVE_${key}` : key] ?? process.env[key];
const adapter = new PrismaMariaDb({
    host: env('DATABASE_HOST'),
    user: env('DATABASE_USER'),
    password: env('DATABASE_PASSWORD'),
    database: env('DATABASE_NAME'),
    connectionLimit: 5
});
/* -------------------------------- */
/* PRISMA CLIENT SINGLETON */
/* -------------------------------- */
const prisma = globalForPrisma.prisma ??
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
