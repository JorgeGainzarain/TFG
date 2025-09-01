// backend/src/server/server.ts
import { urlencoded } from 'body-parser';
import { Application } from 'express';
import { Service } from 'typedi';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import session from "express-session";
import * as http from "node:http";
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Api } from './api/api';
import { config } from '../config/environment';
import { errorHandler } from '../middleware/error_handler';

import { setupSwagger} from "../swagger";

import {
  authRateLimit,
  validateContentType,
  sanitizeInput,
  securityLogger
} from '../middleware/security';
import path from 'node:path';

@Service()
export class Server {

  app: Application;
  serverInstance?: http.Server;

  constructor(private readonly api: Api) {
    this.app = express();
    this.setupServer();
  }

  private setupServer(): void {
    this.app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    this.app.use(securityLogger);

    // === CORS CON CONFIGURACIÓN MEJORADA ===
    this.app.use(cors({
      origin: (origin, callback) => {
        const allowedOrigins = Array.isArray(config.cors.origin)
            ? config.cors.origin
            : [config.cors.origin];

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('No permitido por CORS'));
        }
      },
      credentials: config.cors.credentials,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // === RATE LIMITING GENERAL ===
    const generalRateLimit = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests
    });
    this.app.use(generalRateLimit);

    // === MIDDLEWARE EXISTENTE ===
    this.app.use(express.json({ limit: '5mb' }));
    this.app.use(session(config.user_sessions));
    this.app.use(urlencoded({ extended: false }));
    this.app.use(morgan('dev'));

    // === MIDDLEWARE DE VALIDACIÓN (AÑADIR) ===
    this.app.use(validateContentType as import('express').RequestHandler);
    this.app.use(sanitizeInput);

    this.app.use('/api', this.api.getApiRouter());

    // === RATE LIMITING ESPECÍFICO PARA AUTH (AÑADIR) ===
    this.app.use('/api/auth/login', authRateLimit);
    this.app.use('/api/auth/register', authRateLimit);
    this.app.use('/api/auth/refresh', authRateLimit);

    this.app.use(errorHandler);

    setupSwagger(this.app);

    this.serverInstance = this.app.listen(config.port, this.onHttpServerListening);
  }

  private onHttpServerListening(): void {
    console.log(`🚀 BookHub Server started in ${config.env} mode`);
    console.log(`📍 Server running on ${config.ip}:${config.port}`);
    console.log(`🔒 JWT Authentication enabled`);
    console.log(`🛡️  Security middleware active`);
  }

  public async closeServer(): Promise<void> {
    if (this.serverInstance) {
      return new Promise((resolve, reject) => {
        this.serverInstance!.close((err) => {
          if (err) {
            return reject(err);
          }
          console.log('Server closed');
          resolve();
        });
      });
    }
  }
}