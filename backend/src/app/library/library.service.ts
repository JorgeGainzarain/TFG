import { Library} from "./library.model";
import { Service } from 'typedi';
import { BaseService } from "../base/base.service";
import { LibraryRepository } from "./library.repository";
import { AuditService } from "../audit/audit.service";
import { config } from "../../config/environment";
import { StatusError } from "../../utils/status_error";
import {BookRepository} from "../book/book.repository";

@Service()
export class LibraryService extends BaseService<Library> {
    protected entityConfig = config.entityValues.library;

    constructor(
        protected auditService: AuditService,
        protected libraryRepository: LibraryRepository,
        protected bookRepository: BookRepository
    ) {
        super(
            auditService,
            libraryRepository,
        );
    }

    async getAllByUser(userId: number) {
        const libraries = await this.libraryRepository.getAllByUser(userId);
        if (!libraries) {
            throw new StatusError(404, 'No libraries found for this user');
        }
        return libraries;
    }

    async addBookToUserLibrary(userId: any, title: string, bookId: any) {
        // Check that the book exists
        const bookExists = await this.bookRepository.existsById(bookId);
        if (!bookExists) {
            throw new StatusError(404, `Book with id "${bookId}" not found.`);
        }
        // Check if the book is already in the user's library
        const existingLibrary = await this.libraryRepository.exists({ userId: userId, bookIds: [bookId] });
        if (existingLibrary) {
            throw new StatusError(409, `Book with id "${bookId}" is already in the user's library.`);
        }

        // Add the book to the user's library
        const result = await this.libraryRepository.addBook(userId, title, bookId);
        return result;
    }
}