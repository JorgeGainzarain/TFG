import { merge } from 'lodash';
import { jwtConfig, validateJWTConfig } from './base';

import { development } from './development';
import { production } from './production';

const all = {
  env: process.env.NODE_ENV,
  port: process.env.PORT ? Number(process.env.PORT) : 5000,
  ip: process.env.IP || '0.0.0.0',
  googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY,
  user_forgot_pass_key: '3ac1194d22d53db7e2425d8f',
  user_sessions: {
    // Secret to sign the session ID
    secret: process.env.USER_SESSION_SECRET || 'default_secret',
    // Número de días a los que expirará la sesión
    expiration_days: 7,
    // Número máximo de sesiones activas concurrentemente
    max_active_sessions: 4,
    resave: false,
    saveUninitialized: false,
  },
  ...jwtConfig
};

export const config: any = merge(all, _getEnvironmentConfig());

function _getEnvironmentConfig() {
  if (process.env.NODE_ENV === 'production') {
    return production;
  }
  else {
    return development;
  }
}

validateJWTConfig();
