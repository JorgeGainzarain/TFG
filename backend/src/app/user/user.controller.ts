// REEMPLAZAR backend/src/app/user/user.controller.ts COMPLETO

import { Service } from 'typedi';
import { UserService } from './user.service';
import { User } from "./user.model";
import { BaseController } from "../base/base.controller";
import { config } from "../../config/environment";
import { NextFunction, Request, Response } from "express";
import { createResponse } from "../../utils/response";
import { authenticateJWT } from '../../middleware/authentificate_JWT';

@Service()
export class UserController extends BaseController<User> {
    protected entityConfig = config.entityValues.user;

    constructor(
        protected userService: UserService
    ) {
        super(userService);

        // Rutas de autenticación (sin JWT)
        this.getRouter().post('/register', this.register.bind(this));
        this.getRouter().post('/login', this.login.bind(this));
        this.getRouter().post('/logout', this.logout.bind(this));
        this.getRouter().post('/refresh', this.refresh.bind(this));

        // ARREGLAR: Añadir authenticateJWT middleware a /me
        this.getRouter().get('/me', authenticateJWT, this.getCurrentUser.bind(this));
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await this.userService.register(req.body);
            req.session.token = token;
            res.status(201).json(createResponse('success', 'User registered successfully', {
                user,
                accessToken: token,
                refreshToken: token // Por ahora usamos el mismo token
            }));
        } catch (error: any) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await this.userService.login(req.body);
            req.session.token = token;
            res.status(200).json(createResponse('success', 'Login successful', {
                user,
                accessToken: token,
                refreshToken: token // Por ahora usamos el mismo token
            }));
        } catch (error: any) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.session.token) {
                res.status(200).json(createResponse('success', 'No active session'));
                return;
            }

            req.session.destroy((err: any) => {
                if (err) {
                    next(err);
                    return;
                }
                res.status(200).json(createResponse('success', 'Logout successful'));
            });
        } catch (error: any) {
            next(error);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(401).json(createResponse('error', 'Refresh token required'));
                return;
            }

            // Por ahora, simplemente devolvemos el mismo token
            // En una implementación real, validarías y generarías un nuevo token
            res.status(200).json(createResponse('success', 'Token refreshed', {
                accessToken: refreshToken,
                refreshToken: refreshToken
            }));
        } catch (error: any) {
            next(error);
        }
    }

    async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // MEJORAR: Usar el usuario del middleware JWT
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json(createResponse('error', 'User not authenticated'));
                return;
            }

            const user = await this.userService.getById(userId);

            // Remover password de la respuesta
            const { password, ...userWithoutPassword } = user as any;

            res.status(200).json(createResponse('success', 'User retrieved successfully', {
                user: userWithoutPassword
            }));
        } catch (error: any) {
            next(error);
        }
    }
}