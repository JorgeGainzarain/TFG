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
    }
};