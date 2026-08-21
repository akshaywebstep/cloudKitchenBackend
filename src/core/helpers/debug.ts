// src/core/helpers/debug.ts

const APP_DEBUG = process.env.APP_DEBUG === "true";

/**
 * Debug logger (only works when APP_DEBUG=true)
 */
export const debug = (...args: any[]): void => {
    if (!APP_DEBUG) return;

    console.log("[DEBUG]", ...args);
};

/**
 * Debug error logger
 */
export const debugError = (...args: any[]): void => {
    if (!APP_DEBUG) return;

    console.error("[DEBUG ERROR]", ...args);
};

/**
 * Debug warning logger
 */
export const debugWarn = (...args: any[]): void => {
    if (!APP_DEBUG) return;

    console.warn("[DEBUG WARN]", ...args);
};

/**
 * Export all string helpers as a single object
 */
const debugHelper = {
  debug,
  debugError,
  debugWarn
};

export default debugHelper;