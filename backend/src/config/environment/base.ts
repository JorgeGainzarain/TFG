// src/config/environment/base.ts
import { Review} from "../../app/review/review.model";
import { User } from "../../app/user/user.model";
import { Audit } from "../../app/audit/audit.model";
import { EntityConfig } from "../../app/base/base.model";
import { DBOptions } from "../../database/models/db-options";

export const baseConfig: {
    port: number;
    dbOptions: DBOptions;
    entityValues: {
        audit: EntityConfig<Audit>;
        review: EntityConfig<Review>;
        user: EntityConfig<User>;
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
                { name: 'likes', type: 'INTEGER' }
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
        }
    }
};