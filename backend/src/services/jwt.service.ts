// backend/src/services/jwt.service.ts
import * as jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export interface JWTPayload {
    userId: number;
    email: string;
    username: string;
    iat?: number;
    exp?: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class JWTService {
    private static ACCESS_TOKEN_SECRET = config.jwt.accessTokenSecret || 'your-access-secret';
    private static REFRESH_TOKEN_SECRET = config.jwt.refreshTokenSecret || 'your-refresh-secret';
    private static ACCESS_TOKEN_EXPIRY = '15m';
    private static REFRESH_TOKEN_EXPIRY = '7d';

    static generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
        const accessToken = jwt.sign(
            payload,
            this.ACCESS_TOKEN_SECRET,
            { expiresIn: this.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
        );

        const refreshToken = jwt.sign(
            payload,
            this.REFRESH_TOKEN_SECRET,
            { expiresIn: this.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] }
        );

        return { accessToken, refreshToken };
    }

    static verifyAccessToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;
        } catch (error) {
            throw new Error('Token de acceso inválido');
        }
    }

    static verifyRefreshToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JWTPayload;
        } catch (error) {
            throw new Error('Token de actualización inválido');
        }
    }

    static decodeToken(token: string): JWTPayload | null {
        try {
            return jwt.decode(token) as JWTPayload;
        } catch {
            return null;
        }
    }

    static isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) return true;

        return Date.now() >= decoded.exp * 1000;
    }
}