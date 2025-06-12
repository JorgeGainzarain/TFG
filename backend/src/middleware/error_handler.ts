// backend/src/middleware/error_handler.ts

import { Request, Response, NextFunction } from 'express';
import { StatusError } from '../utils/status_error';
import { config } from '../config/environment';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
    // Evitar enviar respuesta si ya se envió
    if (res.headersSent) {
        return next(err);
    }

    let statusCode: number;
    let message: string;
    let details = null;

    // Logging del error (mejorado)
    console.error('🚨 Error capturado:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: {
            name: err.name,
            message: err.message,
            stack: config.env === 'development' ? err.stack : undefined,
            status: err.status,
            code: err.code
        }
    });

    // === MANEJO DE ERRORES ESPECÍFICOS ===

    // 1. Tu StatusError existente (PRIORIDAD MÁXIMA)
    if (err instanceof StatusError) {
        statusCode = err.status;
        message = err.message;
        details = err.details;
    }

    // 2. Errores de sintaxis JSON (mantienes tu lógica)
    else if (err instanceof SyntaxError && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON format';
    }

    // 3. Errores de JWT (convertidos a tu StatusError)
    else if (err.name === 'JsonWebTokenError') {
        const statusError = StatusError.invalidToken();
        statusCode = statusError.status;
        message = statusError.message;
    }
    else if (err.name === 'TokenExpiredError') {
        const statusError = StatusError.expiredToken();
        statusCode = statusError.status;
        message = statusError.message;
    }
    else if (err.name === 'NotBeforeError') {
        const statusError = StatusError.unauthorized('Token no activo aún');
        statusCode = statusError.status;
        message = statusError.message;
    }

    // 4. Errores de MongoDB/Base de datos
    else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        switch (err.code) {
            case 11000: // Duplicate key
                const field = Object.keys(err.keyPattern || {})[0];
                const conflictError = StatusError.conflict(
                    field ? `El ${field} ya existe` : 'Ya existe un registro con estos datos'
                );
                statusCode = conflictError.status;
                message = conflictError.message;
                break;
            default:
                const dbError = StatusError.internal('Error de base de datos');
                statusCode = dbError.status;
                message = dbError.message;
        }
    }

    // 5. Errores de validación
    else if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors || {}).map((error: any) => ({
            field: error.path,
            message: error.message
        }));
        const validationError = StatusError.validation('Datos de entrada inválidos', validationErrors);
        statusCode = validationError.status;
        message = validationError.message;
        details = validationError.details;
    }

    // 6. Errores de límite de tamaño
    else if (err.message && err.message.includes('request entity too large')) {
        const sizeError = StatusError.badRequest('Archivo demasiado grande');
        statusCode = sizeError.status;
        message = sizeError.message;
    }

    // 7. Errores de conexión
    else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        statusCode = 503;
        message = 'Servicio no disponible';
    }

    // 8. Otros errores (mantener tu lógica original)
    else {
        statusCode = 500;
        message = 'Internal Server Error';
        console.error(err); // Tu log original
    }

    // === RESPUESTA (mantiene tu formato) ===
    const errorResponse: any = {
        error: message
    };

    // Añadir detalles si existen (para validaciones)
    if (details) {
        errorResponse.details = details;
    }

    // En desarrollo, incluir información adicional del error
    if (config.env === 'development') {
        errorResponse.debug = {
            name: err.name,
            stack: err.stack,
            code: err.code,
            originalMessage: err.message
        };
    }

    // No exponer información sensible en producción
    if (config.env === 'production' && statusCode === 500) {
        errorResponse.error = 'Internal Server Error';
        delete errorResponse.debug;
    }

    res.status(statusCode).json(errorResponse);
}