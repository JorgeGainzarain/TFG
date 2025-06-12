// backend/src/middleware/security.ts

import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { StatusError } from '../utils/status_error';
import { createResponse } from '../utils/response';

// Rate limiting estricto para autenticación
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por IP
    message: 'Demasiados intentos de autenticación, intenta más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req: Request, res: Response) => {
        // Usar tu StatusError para consistencia
        const error = StatusError.tooManyRequests(
            'Demasiados intentos de autenticación. Espera 15 minutos antes de intentar nuevamente.'
        );

        res.status(error.status).json(createResponse(
            'error',
            error.message
        ));
    }
});

// Middleware para validar Content-Type en requests POST/PUT
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (!req.is('application/json')) {
            const error = StatusError.badRequest('Content-Type debe ser application/json');
            return res.status(error.status).json(createResponse('error', error.message));
        }
    }
    next();
};

// Middleware para sanitizar entrada
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Limpiar campos comunes de inyección
    const sanitizeObject = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;

        const sanitized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];

                // Eliminar caracteres peligrosos en strings
                if (typeof value === 'string') {
                    value = value.trim();
                    // Eliminar caracteres de control y algunos especiales
                    value = value.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
                    // Limitar longitud para prevenir ataques
                    if (value.length > 10000) {
                        value = value.substring(0, 10000);
                    }
                }

                // Recursivo para objetos anidados
                if (typeof value === 'object' && value !== null) {
                    value = sanitizeObject(value);
                }

                sanitized[key] = value;
            }
        }
        return sanitized;
    };

    if (req.body) {
        req.body = sanitizeObject(req.body);
    }

    next();
};

// Middleware para logging de seguridad
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            status: res.statusCode,
            duration: `${duration}ms`
        };

        // Log de eventos sospechosos
        if (res.statusCode === 401 || res.statusCode === 403) {
            console.warn('🔒 Intento de acceso no autorizado:', logData);
        } else if (res.statusCode === 429) {
            console.warn('⚠️ Rate limit excedido:', logData);
        } else if (res.statusCode >= 500) {
            console.error('💥 Error del servidor:', logData);
        }
    });

    next();
};

// Helper para crear errores de validación usando tu StatusError
export const createValidationError = (message: string, fieldErrors?: any[]) => {
    return StatusError.validation(message, fieldErrors);
};