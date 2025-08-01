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

    async create(library: Library): Promise<Library> {
        if (library.bookIds.length === 0) {
            library.bookIds = '';
        }
        else {
            library.bookIds = library.bookIds.toString()
        }
        console.log("Library", library)
        const response = await super.create(library);
        console.log("Library response", response);
        return response;
    }

    async update(id: number, library: Partial<Library>): Promise<Library> {
        if (library.bookIds && Array.isArray(library.bookIds)) {
            library.bookIds = library.bookIds.toString();
        }
        return await super.update(id, library);
    }

    async getAllByUser(userId: number) {
        const queryDoc = {
            sql: `SELECT * FROM ${this.entityConfig.table_name} WHERE userId = ?`,
            params: [userId]
        }

        const result = await this.databaseService.execQuery(queryDoc);

        if (!result) {
            throw new StatusError(404, `No libraries found for user with id "${userId}".`);
        }
        if (result.rowCount === 0) {
            return []; // No books found for the user
        }

        for (const row of result.rows) {
            if (row.bookIds === '') {
                row.bookIds = [];
            }
            else {
                row.bookIds = row.bookIds.split(',')
            }
        }

        return result.rows;
    }

    async addBook(userId: any, title: string, bookId: any) {

        console.log("Control Repo 1")

        const library = await this.findByFields({userId: userId, title: title});
        if (!library) {
            throw new StatusError(404, `Library for user with id "${userId}" not found.`);
        }


        if (typeof library.bookIds === "string") {
            if (library.bookIds === '') {
                library.bookIds = [];
            }
            else {
                library.bookIds = library.bookIds.split(',')
            }
        }

        library.bookIds.push(bookId);
        if (!library.id) {
            throw new StatusError(500, `Library for user with id "${userId}" does not have an ID.`);
        }


        const result = await this.update(library.id, {
            bookIds: library.bookIds
        });

        if (!result) {
            throw new StatusError(500, `Failed to add book with id "${bookId}" to the user's library.`);
        }

        return result;
    }

    async findByFields(fields: Partial<Library>): Promise<Library | undefined> {
        const library = await super.findByFields(fields);
        if (!library) {
            return undefined;
        }
        if (library.bookIds.length === 0) {
            library.bookIds = [];
        }
        else if (typeof library.bookIds === 'string') {
            library.bookIds = library.bookIds.split(',');
        }
        return library;
    }

    async removeBook(userId: any, title: any, bookId: string) {
        const library = await this.findByFields({ userId: userId, title: title });
        if (!library) {
            throw new StatusError(404, `Library with title "${title}" not found for user with ID "${userId}".`);
        }

        if (!library.bookIds || !Array.isArray(library.bookIds)) {
            throw new StatusError(400, `Library with title "${title}" does not have any books.`);
        }

        const bookIndex = library.bookIds.indexOf(bookId);
        if (bookIndex === -1) {
            throw new StatusError(404, `Book with ID "${bookId}" not found in library "${title}".`);
        }

        library.bookIds.splice(bookIndex, 1);

        if (!library.id) {
            throw new StatusError(500, `Library with title "${title}" does not have an ID.`);
        }
        return await this.update(library.id, { bookIds: library.bookIds });
    }
}