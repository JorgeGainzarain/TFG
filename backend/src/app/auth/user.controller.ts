import { Service } from 'typedi';
import { UserService } from './user.service';
import { User } from "./user.model";
import { BaseController } from "../base/base.controller";
import { config } from "../../config/environment";
import { NextFunction, Request, Response } from "express";
import { createResponse } from "../../utils/response";
import { authenticateJWT } from '../../middleware/authentificate_JWT';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           nullable: true
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

@Service()
export class UserController extends BaseController<User> {
    protected entityConfig = config.entityValues.user;

    constructor(
        protected userService: UserService
    ) {
        super(userService);

        this.getRouter().post('/register', this.register.bind(this));
        this.getRouter().post('/login', this.login.bind(this));
        this.getRouter().post('/logout', this.logout.bind(this));
        this.getRouter().post('/refresh', this.refresh.bind(this));
        this.getRouter().get('/me', authenticateJWT, this.getCurrentUser.bind(this));
    }

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     tags:
     *       - Users
     *     summary: Register a new user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - email
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *                     accessToken:
     *                       type: string
     *                     refreshToken:
     *                       type: string
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       409:
     *         description: User already exists
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await this.userService.register(req.body);
            req.session.token = token;
            res.status(201).json(createResponse('success', 'User registered successfully', {
                user,
                accessToken: token,
                refreshToken: token
            }));
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     tags:
     *       - Users
     *     summary: Login a user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *                     accessToken:
     *                       type: string
     *                     refreshToken:
     *                       type: string
     *       400:
     *         description: Validation error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Invalid email or password
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { user, token } = await this.userService.login(req.body);
            req.session.token = token;
            res.status(200).json(createResponse('success', 'Login successful', {
                user,
                accessToken: token,
                refreshToken: token
            }));
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     tags:
     *       - Users
     *     summary: Logout current user
     *     responses:
     *       200:
     *         description: Logout successful or no active session
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
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

    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     tags:
     *       - Users
     *     summary: Refresh JWT token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: Token refreshed
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   properties:
     *                     accessToken:
     *                       type: string
     *                     refreshToken:
     *                       type: string
     *       401:
     *         description: Refresh token required or invalid
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(401).json(createResponse('error', 'Refresh token required'));
                return;
            }

            res.status(200).json(createResponse('success', 'Token refreshed', {
                accessToken: refreshToken,
                refreshToken: refreshToken
            }));
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * @swagger
     * /auth/me:
     *   get:
     *     tags:
     *       - Users
     *     summary: Get current authenticated user
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Current user retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 message:
     *                   type: string
     *                 data:
     *                   type: object
     *                   properties:
     *                     user:
     *                       $ref: '#/components/schemas/User'
     *       401:
     *         description: User not authenticated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json(createResponse('error', 'User not authenticated'));
                return;
            }

            const user = await this.userService.getById(userId);
            const { password, ...userWithoutPassword } = user as any;

            res.status(200).json(createResponse('success', 'User retrieved successfully', {
                user: userWithoutPassword
            }));
        } catch (error: any) {
            next(error);
        }
    }
}