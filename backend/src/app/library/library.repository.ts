import { Library } from "./library.model";
import { Service } from 'typedi';
import { BaseRepository } from "../base/base.repository";
import { config } from "../../config/environment";
import { DatabaseService } from "../../database/database.service";
import { StatusError } from "../../utils/status_error";


@Service()
export class LibraryRepository extends BaseRepository<Library> {
    protected entityConfig = config.entityValues.library;

    constructor(
        protected readonly databaseService: DatabaseService
    ) {
        super(databaseService);
    }

    async getAllByUser(userId: number) {
        const querDoc = {
            sql: `SELECT b.* FROM ${this.entityConfig.table_name} b
                  JOIN ${this.entityConfig.table_name} ul ON b.id = ul.book_id
                  WHERE ul.user_id = ?`,
            params: [userId]
        }

        const result = await this.databaseService.execQuery(querDoc);

        if (!result) {
            throw new StatusError(404, `No libraries found for user with id "${userId}".`);
        }
        if (result.rowCount === 0) {
            return []; // No books found for the user
        }

        return result;
    }

    async addBook(userId: any, title: string, bookId: any) {
        // Check if the book is already in the user's library
        const existingLibrary = await this.exists({ userId: userId, title: title, bookIds: [bookId] });
        if (existingLibrary) {
            throw new StatusError(409, `Book with id "${bookId}" is already in the user's library.`);
        }

        const library = await this.findByFields({userId: userId, title: title});
        if (!library) {
            throw new StatusError(404, `Library for user with id "${userId}" not found.`);
        }
        library.bookIds.push(bookId);

        const result = await this.update(library.id, {
            bookIds: library.bookIds
        });

        if (!result) {
            throw new StatusError(500, `Failed to add book with id "${bookId}" to the user's library.`);
        }

        return result;
    }
}