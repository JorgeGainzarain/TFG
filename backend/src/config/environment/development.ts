// src/config/environment/development.ts
import { baseConfig } from './base';

export const development = {
  ...baseConfig,
  dbOptions: {
    ...baseConfig.dbOptions,
    database: 'dev-books.db',
    },

    jwt: {
      accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
      refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '7d'
    },

    rateLimit: {
      windowMs: 900000, // 15 minutos
      maxRequests: 1000, // Más permisivo en desarrollo
      skipSuccessfulRequests: true
    },

    security: {
      bcryptRounds: 10, // Menos rounds en desarrollo para velocidad
      cookieMaxAge: 86400000
    },

    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'], // Múltiples orígenes en dev
      credentials: true
    },

    logging: {
      level: 'debug', // Más detallado en desarrollo
      file: './logs/dev-app.log'
    }
};