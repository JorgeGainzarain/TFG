// REEMPLAZAR backend/src/middleware/authentificate_JWT.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusError } from '../utils/status_error';
import { config } from '../config/environment';

export interface AuthenticatedRequest extends Request {
    user: {
        id: number;
        email: string;
        username?: string;
        iat?: number;
        exp?: number;
    };
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Check Authorization header first, then fallback to session
        const authHeader = req.headers.authorization;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        } else {
            token = req.session.token;
        }

        if (!token) {
            throw StatusError.missingToken('Access token is missing or invalid');
        }

        // ARREGLAR: Usar el secret correcto del config
        const jwtSecret = config.jwt?.accessTokenSecret || process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

        if (!jwtSecret) {
            console.error('JWT Secret not found in middleware:', {
                configJwt: config.jwt,
                envJWT_SECRET: process.env.JWT_SECRET,
                envJWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET
            });
            throw StatusError.internal('JWT configuration error');
        }

        jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    throw StatusError.expiredToken();
                } else if (err.name === 'JsonWebTokenError') {
                    throw StatusError.invalidToken();
                } else if (err.name === 'NotBeforeError') {
                    throw StatusError.unauthorized('Token no activo aún');
                } else {
                    throw StatusError.invalidToken('Error al verificar token');
                }
            }

            // Agregar información del usuario al request
            (req as AuthenticatedRequest).user = decoded as any;
            next();
        });

    } catch (error) {
        // Si es un StatusError, pasarlo directamente
        if (error instanceof StatusError) {
            next(error);
        } else {
            // Convertir otros errores a StatusError
            next(StatusError.unauthorized('Error de autenticación'));
        }
    }
};