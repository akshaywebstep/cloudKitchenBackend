const hasLiveDatabaseEnv = Boolean(
    process.env.LIVE_DATABASE_HOST ||
    process.env.LIVE_DATABASE_NAME ||
    process.env.LIVE_DATABASE_USER
);

export const DB_ENV = process.env.DB_ENV || (hasLiveDatabaseEnv ? 'live' : 'local');
export const isLiveDatabase = DB_ENV === 'live';

export const getDatabaseEnv = (key: string) => (
    process.env[isLiveDatabase ? `LIVE_${key}` : key] ?? process.env[key]
);

const splitHostAndPort = (host: string | undefined) => {
    const trimmed = host?.trim();

    if (!trimmed) {
        return { host: undefined, port: undefined };
    }

    if (trimmed.includes('://') || trimmed.startsWith('[')) {
        return { host: trimmed, port: undefined };
    }

    const match = trimmed.match(/^(.+):(\d+)$/);

    if (!match) {
        return { host: trimmed, port: undefined };
    }

    return {
        host: match[1],
        port: Number(match[2])
    };
};

const envNumber = (key: string, fallback: number) => {
    const value = Number(getDatabaseEnv(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
};

const explicitDatabasePort = () => {
    const key = isLiveDatabase ? 'LIVE_DATABASE_PORT' : 'DATABASE_PORT';
    const value = Number(process.env[key]);
    return Number.isFinite(value) && value > 0 ? value : undefined;
};

const hostParts = () => splitHostAndPort(getDatabaseEnv('DATABASE_HOST'));

export const getDatabaseHost = () => hostParts().host;

export const getDatabasePort = () => {
    const parsedPort = hostParts().port;
    const explicitPort = explicitDatabasePort();

    if (explicitPort) {
        return explicitPort;
    }

    if (parsedPort) {
        return parsedPort;
    }

    return envNumber('DATABASE_PORT', 3306);
};

export const getDatabaseName = () => getDatabaseEnv('DATABASE_NAME');

export const getDatabaseTarget = () => ({
    env: DB_ENV,
    host: getDatabaseHost(),
    port: getDatabasePort(),
    database: getDatabaseName()
});
