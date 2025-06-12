
export class StatusError extends Error {
    status: number;
    code?: string | number;
    details?: any;
    isOperational?: boolean;

    constructor(status: number, message: string, code?: string | number, details?: any) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.isOperational = true;

        this.name = 'StatusError';

        // Capturar stack trace si está disponible
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, StatusError);
        }
    }

    // Métodos estáticos para crear errores comunes manteniendo tu patrón
    static badRequest(message: string, details?: any): StatusError {
        return new StatusError(400, message, 'BAD_REQUEST', details);
    }

    static unauthorized(message: string = 'No autorizado'): StatusError {
        return new StatusError(401, message, 'UNAUTHORIZED');
    }

    static forbidden(message: string = 'Acceso prohibido'): StatusError {
        return new StatusError(403, message, 'FORBIDDEN');
    }

    static notFound(message: string): StatusError {
        return new StatusError(404, message, 'NOT_FOUND');
    }

    static conflict(message: string): StatusError {
        return new StatusError(409, message, 'CONFLICT');
    }

    static validation(message: string, details?: any): StatusError {
        return new StatusError(400, message, 'VALIDATION_ERROR', details);
    }

    static tooManyRequests(message: string = 'Demasiadas solicitudes'): StatusError {
        return new StatusError(429, message, 'TOO_MANY_REQUESTS');
    }

    static internal(message: string = 'Error interno del servidor'): StatusError {
        return new StatusError(500, message, 'INTERNAL_ERROR');
    }

    // Métodos específicos para JWT (mantienen tu estilo)
    static invalidToken(message: string = 'Token inválido'): StatusError {
        return new StatusError(401, message, 'INVALID_TOKEN');
    }

    static expiredToken(message: string = 'Token expirado'): StatusError {
        return new StatusError(401, message, 'EXPIRED_TOKEN');
    }

    static missingToken(message: string = 'Token requerido'): StatusError {
        return new StatusError(401, message, 'MISSING_TOKEN');
    }
}