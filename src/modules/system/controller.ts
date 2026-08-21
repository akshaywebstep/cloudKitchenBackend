import { Request, Response } from 'express';
import { formatBytes } from '../../core/helpers/formatBytes.helper';
import { getDatabaseTarget } from '../../core/config/databaseEnv';
import { prisma } from '../../../lib/prisma';

export const getHealth = async (req: Request, res: Response) => {
    const database = getDatabaseTarget();
    let databaseStatus = 'Connected';
    let databaseError: string | undefined;

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
        databaseStatus = 'Disconnected';
        databaseError = error instanceof Error ? error.message : 'Database connection failed';
    }

    res.status(200).json({
        status: databaseStatus === 'Connected' ? 'UP' : 'DOWN',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
            env: database.env,
            host: database.host,
            port: database.port,
            name: database.database,
            status: databaseStatus,
            ...(databaseError ? { error: databaseError } : {})
        }
    });
};

export const getHello = (req: Request, res: Response) => {
    res.status(200).json({
        status: true,
        message: 'Welcome to the Cloud Kitchen API',
        version: '1.0.0'
    });
};

export const getSystemInfo = (req: Request, res: Response) => {
    const memory = process.memoryUsage();

    res.status(200).json({
        platform: process.platform,
        nodeVersion: process.version,

        memoryUsage: {
            heapUsed: formatBytes(memory.heapUsed),
            heapTotal: formatBytes(memory.heapTotal),
            rss: formatBytes(memory.rss),
            external: formatBytes(memory.external),
        }
    });
};