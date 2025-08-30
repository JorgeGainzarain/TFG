// REEMPLAZAR backend/src/app/user/user.service.ts

import { Service } from 'typedi';
import { AuditService } from '../audit/audit.service';
import { User } from './user.model';
import { UserRepository } from './user.repository';
import { BaseService } from "../base/base.service";
import { config } from "../../config/environment";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { StatusError } from "../../utils/status_error";
import { validateObject, validatePartialObject } from "../../utils/validation";
import {LibraryService} from "../libraries/library.service";

dotenv.config();

@Service()
export class UserService extends BaseService<User> {
    protected entityConfig = config.entityValues.user;

    constructor(
        protected auditService: AuditService,
        protected userRepository: UserRepository,
        protected libraryService: LibraryService,
    ) {
        super(auditService, userRepository);
    }

    public async register(part_user: Partial<User>): Promise<{ user: Omit<User, 'password'>, token: string }> {

        // Validar que el username no exista
        const existingUsers = await this.userRepository.findByFields({ email: part_user.email });
        console.log('Existing users with email:', existingUsers);
        if (existingUsers && existingUsers.length > 0) {
            throw new StatusError(409, 'A user with this username already exists');
        }

        // Añadir createdAt si no se proporciona
        if (!part_user.createdAt) {
            part_user.createdAt = new Date();
        }

        // Validar los campos requeridos
        const user = validateObject(part_user, this.entityConfig.requiredFields);
        const saltRounds = config.security?.bcryptRounds;
        user.password = await bcrypt.hash(user.password, saltRounds);
        console.log('Creating user with data:', { ...user, password: '***' });
        const createdUser = await this.userRepository.create(user);
        console.log("User created:", { ...createdUser, password: '***' });
        const { password, ...userWithoutPassword } = createdUser;

        // ARREGLAR: Usar el secret correcto del config
        const jwtSecret = config.jwt?.accessTokenSecret || process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

        if (!jwtSecret) {
            console.error('JWT Secret not found in:', {
                configJwt: config.jwt,
                envJWT_SECRET: process.env.JWT_SECRET,
                envJWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET
            });
            throw new StatusError(500, 'JWT configuration error');
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: createdUser.id,
                email: createdUser.email,
                username: createdUser.username
            },
            jwtSecret,
            { expiresIn: config.jwt?.accessTokenExpiry || '24h' }
        );

        await this.libraryService.createDefaultLibraries(createdUser.id);

        await this.auditAction({ ...userWithoutPassword, password: '' } as User, 'registered');
        return { user: userWithoutPassword, token };
    }

    public async login(part_user: Partial<User>): Promise<{ user: Omit<User, 'password'>, token: string }> {
        const user = validatePartialObject(part_user, this.entityConfig.requiredFields);
        if (!user.email || !user.password) {
            throw new StatusError(400, 'Email and password are required');
        }


        const foundUsers = await this.userRepository.findByFields({ email: user.email });
        console.log('Found users:', foundUsers);
        if (!foundUsers || foundUsers.length !== 1) {
            console.log('User not found or multiple users with same email');
            throw new StatusError(401, 'Invalid email or password');
        }
        const foundUser = foundUsers[0];
        console.log('Found user for login:', foundUser);

        const isValidPassword = await bcrypt.compare(user.password, foundUser.password);

        if (!isValidPassword) {
            throw new StatusError(401, 'Invalid email or password');
        }

        // ARREGLAR: Usar el secret correcto del config
        const jwtSecret = config.jwt?.accessTokenSecret || process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;

        if (!jwtSecret) {
            console.error('JWT Secret not found in:', {
                configJwt: config.jwt,
                envJWT_SECRET: process.env.JWT_SECRET,
                envJWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET
            });
            throw new StatusError(500, 'JWT configuration error');
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                id: foundUser.id,
                email: foundUser.email,
                username: foundUser.username
            },
            jwtSecret,
            { expiresIn: config.jwt?.accessTokenExpiry || '24h' }
        );

        const { password, ...userWithoutPassword } = foundUser;

        await this.auditAction({ ...userWithoutPassword, password: '' }, 'logged in');
        return { user: userWithoutPassword, token };
    }

    public async verifyToken(token: string): Promise<{ id: number, email: string } | null> {
        try {
            const jwtSecret = config.jwt?.accessTokenSecret || process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
            if (!jwtSecret) {
                throw new Error('JWT Secret not configured');
            }

            const decoded = jwt.verify(token, jwtSecret) as any;
            return { id: decoded.id, email: decoded.email };
        } catch (error) {
            return null;
        }
    }

    public async getUserFromToken(token: string): Promise<Omit<User, 'password'> | null> {
        try {
            const decoded = await this.verifyToken(token);
            if (!decoded) {
                return null;
            }

            const user = await this.userRepository.findById(decoded.id);
            if (!user) {
                return null;
            }

            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            return null;
        }
    }
}