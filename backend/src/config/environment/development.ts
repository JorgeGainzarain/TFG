// src/config/environment/development.ts
import { baseConfig } from './base';

export const development = {
  ...baseConfig,
  dbOptions: {
    ...baseConfig.dbOptions,
    database: 'dev-books.db'
  }
};