// src/index.ts
import cluster from 'cluster';
import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes/v1/index';
import debugHelper from './core/helpers/debug';
import { DB_ENV, getDatabaseTarget } from './core/config/databaseEnv';


const SERVER_PORT = Number(process.env.PORT) || 3000;
const ENV = process.env.NODE_ENV || 'development';
const parsePositiveInt = (value: string | undefined, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};
const requestedClusters = process.env.WEB_CONCURRENCY || process.env.CLUSTERS;
const NUM_CLUSTERS = parsePositiveInt(requestedClusters, 1);
const appUrl = process.env.APP_URL || process.env.RENDER_EXTERNAL_URL || 'https://cloud-kitchen-node-x2ok.onrender.com';
const rawCors = process.env.CORS_ORIGIN || appUrl || 'http://127.0.0.1:5173,http://localhost:5173';
const allowAllOrigins = rawCors.trim() === '*';
const normalizeOrigin = (value: string | undefined): string | null => {
    if (!value) return null;

    const trimmed = value.trim().replace(/\/+$/, '');
    if (!trimmed) return null;

    try {
        return new URL(trimmed).origin;
    } catch {
        return trimmed;
    }
};
const allowedOrigins = allowAllOrigins
    ? []
    : rawCors
        .split(',')
        .map(origin => normalizeOrigin(origin))
        .filter((origin): origin is string => Boolean(origin));

const corsOptions = {
    origin(origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
        // Log incoming origin for debugging
        debugHelper.debug('CORS request origin:', origin);

        const requestOrigin = normalizeOrigin(origin);
        const isLocalDevOrigin = !!requestOrigin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(requestOrigin);

        if (!requestOrigin || allowAllOrigins || allowedOrigins.includes(requestOrigin) || isLocalDevOrigin) {
            callback(null, true);
            return;
        }

        debugHelper.debug(`CORS blocked origin: ${requestOrigin}. Allowed origins: ${allowedOrigins.join(', ')}`);
        callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true
};

// Development: single worker, no clustering
if (ENV === 'development' || NUM_CLUSTERS <= 1) {
    const app: Application = express();
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use('/api/v1', routes);

    app.listen(SERVER_PORT, () => {
        console.log(`Server running on port ${SERVER_PORT}`);
        debugHelper.debug(`-----------------------------------------`);
        debugHelper.debug(`🚀 Server (DEV) running on http://localhost:${SERVER_PORT}/api/v1/system/hello`);
        debugHelper.debug(`🏥 Health Check: http://localhost:${SERVER_PORT}/api/v1/system/health`);
        const database = getDatabaseTarget();
        debugHelper.debug(`DB Target   : ${database.database} (${database.host}:${database.port}) env=${DB_ENV}`);
        debugHelper.debug(`-----------------------------------------`);
    });

} else if (cluster.isMaster) {
    // Master process (production/staging)
    debugHelper.debug(`🛠 Master PID: ${process.pid}`);
    debugHelper.debug(`🚀 Forking ${NUM_CLUSTERS} workers...`);

    // Fork workers
    for (let i = 0; i < NUM_CLUSTERS; i++) {
        cluster.fork();
    }

    // Restart workers on exit
    cluster.on('exit', (worker, code, signal) => {
        debugHelper.debug(`⚠ Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
        // Optional: restart worker
        cluster.fork();
    });

    // Graceful shutdown
    function shutdown() {
        debugHelper.debug('🛑 Master shutting down all workers...');
        for (const id in cluster.workers) {
            cluster.workers[id]?.kill('SIGTERM');
        }
        process.exit(0);
    }

    process.on('SIGINT', shutdown);  // Ctrl+C
    process.on('SIGTERM', shutdown); // External stop

} else {
    // Worker process
    const app: Application = express();

    // Standard middleware
    app.use(cors(corsOptions));
    app.use(express.json());

    // Routes
    app.use('/api/v1', routes);

    const server = app.listen(SERVER_PORT, () => {
        console.log(`Worker ${process.pid} running on port ${SERVER_PORT}`);
        debugHelper.debug(`-----------------------------------------`);
        debugHelper.debug(`🚀 Worker PID: ${process.pid} listening on http://localhost:${SERVER_PORT}/api/v1/system/hello`);
        debugHelper.debug(`🏥 Health Check: http://localhost:${SERVER_PORT}/api/v1/system/health`);
        const database = getDatabaseTarget();
        debugHelper.debug(`DB Target   : ${database.database} (${database.host}:${database.port}) env=${DB_ENV}`);
        debugHelper.debug(`-----------------------------------------`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        debugHelper.debug(`🛑 Worker PID: ${process.pid} shutting down...`);
        server.close(() => process.exit(0));
    });
}
