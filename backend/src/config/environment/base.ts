// src/config/environment/base.ts
import { Review} from "../../app/reviews/review.model";
import { User } from "../../app/auth/user.model";
import { Audit } from "../../app/audit/audit.model";
import { EntityConfig } from "../../app/base/base.model";
import { DBOptions } from "../../database/models/db-options";
import {Book} from "../../app/books/book.model";
import {Library} from "../../app/libraries/library.model";
import {Like} from "../../app/likes/like.model"
import {Library_Book} from "../../app/library_books/library_books.model";

const libraries =  [
    "Leyendo",
    "Completados",
    "Por Leer",
    "Favoritos"
];

export const baseConfig: {
    port: number;
    dbOptions: DBOptions;
    entityValues: {
        audit: EntityConfig<Audit>;
        review: EntityConfig<Review>;
        like: EntityConfig<Like>
        book: EntityConfig<Book>;
        user: EntityConfig<User>;
        library: EntityConfig<Library>
        library_books: EntityConfig<Library_Book>;
    };
} = {
    port: 5000,

    dbOptions: {
        user: 'dbUser',
        host: 'localhost',
        database: 'book.db',
        password: 'dbPassword',
        port: 5432
    },

    entityValues: {
        audit: {
            table_name: 'audits',
            unit: 'Audit',
            requiredFields: [
                { name: 'message', type: 'TEXT' }
            ]
        },
        review: {
            table_name: 'reviews',
            unit: 'Review',
            requiredFields: [
                { name: 'bookId', type: 'INTEGER' },
                { name: 'userId', type: 'INTEGER' },
                { name: 'rating', type: 'INTEGER' },
                { name: 'comment', type: 'TEXT' },
                { name: 'createdAt', type: 'DATETIME' },
                {name: 'likes', type: 'INTEGER' },
            ]
        },
        like: {
            table_name: 'likes',
            unit: 'Like',
            requiredFields: [
                { name: 'reviewId', type: 'INTEGER' },
                { name: 'userId', type: 'INTEGER' },
            ]
        },
        book: {
            table_name: 'books',
            unit: 'Book',
            requiredFields: [
                { name: 'bookId', type: 'TEXT' },
                { name: 'title', type: 'TEXT' },
                { name: 'authors', type: 'TEXT' },
                { name: 'publishedDate', type: 'DATETIME' },
                { name: 'description', type: 'TEXT' },
                { name: 'pageCount', type: 'INTEGER' },
                { name: 'categories', type: 'TEXT' },
                { name: 'thumbnail', type: 'TEXT' },
                { name: 'language', type: 'TEXT' },
                { name: 'previewLink', type: 'TEXT' },
            ]
        },
        user: {
            table_name: 'users',
            unit: 'User',
            requiredFields: [
                { name: 'username', type: 'TEXT' },
                { name: 'email', type: 'TEXT' },
                { name: 'password', type: 'TEXT' },
                { name: 'createdAt', type: 'DATETIME' },
            ]
        },
        library: {
            table_name: 'libraries',
            unit: 'Library',
            defaultEntities: libraries,
            requiredFields: [
                { name: 'userId', type: 'INTEGER' },
                { name: 'title', type: 'TEXT' }
            ]
        },
        library_books: {
            table_name: 'library_books',
            unit: 'LibraryBook',
            requiredFields: [
                { name: 'libraryId', type: 'INTEGER' },
                { name: 'bookId', type: 'TEXT' }
            ]
        }
    }
};

// Extender la interfaz del baseConfig existente
export const jwtConfig = {
    // Configuración JWT
    jwt: {
        accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-this-in-production',
        refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production',
        accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    },

    // Configuración de rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutos
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        skipSuccessfulRequests: true
    },

    // Configuración de seguridad
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
        cookieMaxAge: parseInt(process.env.COOKIE_MAX_AGE || '86400000') // 24 horas
    },

    // Configuración de CORS
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true
    },

    // Configuración de logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log'
    }
};

// Función para validar variables de entorno críticas
export const validateJWTConfig = () => {
    const requiredEnvVars = [
        'JWT_ACCESS_SECRET',
        'JWT_REFRESH_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
        throw new Error(`Variables de entorno JWT faltantes: ${missingVars.join(', ')}`);
    }

    if (missingVars.length > 0) {
        console.warn('⚠️  Variables de entorno JWT faltantes (usando valores por defecto):', missingVars.join(', '));
        console.warn('⚠️  Asegúrate de configurarlas en producción');
    }
};