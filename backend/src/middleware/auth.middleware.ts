// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/environment';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
    };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            status: 'error',
            message: 'Access token required'
        });
        return;
    }

    try {
        const jwtSecret = config.jwt?.accessTokenSecret || process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

        if (!jwtSecret) {
            console.error('JWT Secret not configured');
            res.status(500).json({
                status: 'error',
                message: 'Server configuration error'
            });
            return;
        }

        const decoded = jwt.verify(token, jwtSecret) as any;

        // Add user info to request object
        req.user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username
        };

        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({
            status: 'error',
            message: 'Invalid or expired token'
        });
        return;
    }
};