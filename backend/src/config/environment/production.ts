// src/config/environment/production.ts
import { baseConfig } from './base';

export const production = {
    ...baseConfig,
    dbOptions: {
        ...baseConfig.dbOptions,
        database: 'prod-books.db',
        port: 1000
    },
    entityValues: {
        ...baseConfig.entityValues,
    },

    jwt: {
        // En producción, OBLIGATORIO usar variables de entorno
        accessTokenSecret: process.env.JWT_ACCESS_SECRET!,
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET!,
        accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '50'), // Más estricto en producción
        skipSuccessfulRequests: true
    },

    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'), // Más seguro en producción
        cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE || '86400000')
    },

    cors: {
        origin: process.env.CORS_ORIGIN!, // Obligatorio definir en producción
        credentials: true
    },

    logging: {
        level: process.env.LOG_LEVEL || 'warn', // Solo warnings y errores en producción
        file: process.env.LOG_FILE || './logs/prod-app.log'
    }
};