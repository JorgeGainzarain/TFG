import { Library} from "./library.model";
import { Service } from 'typedi';
import { BaseService } from "../base/base.service";
import { LibraryRepository } from "./library.repository";
import { AuditService } from "../audit/audit.service";
import { config } from "../../config/environment";
import { StatusError } from "../../utils/status_error";
import {BookService} from "../books/book.service";

@Service()
export class LibraryService extends BaseService<Library> {
    protected entityConfig = config.entityValues.library;
    protected bookEntityConfig = config.entityValues.book;

    constructor(
        protected auditService: AuditService,
        protected libraryRepository: LibraryRepository,
        protected bookService: BookService,
    ) {
        super(
            auditService,
            libraryRepository,
        );
    }

    async create(part_entity: Partial<Library>): Promise<Library> {
        if (!part_entity.userId) {
            throw new StatusError(401, 'Authentication required to create a library');
        }
        // Set the BookIds to a empty array if not provided
        if (!part_entity.bookIds) {
            part_entity.bookIds = [];
        }
        return await super.create(part_entity);
    }

    async createDefaultLibraries(userId: any) {
        const defaultLibraries = this.entityConfig.defaultEntities;
        const createdLibraries = [];
        for (const library of defaultLibraries) {
            const libraryEntity = { userId: userId, title: library };
            let createdLibrary = await this.create(libraryEntity);
            createdLibraries.push(createdLibrary);
        }
        return createdLibraries;
    }

    async getAllByUser(userId: number): Promise<Library[]> {
        if (!userId) {
            throw new StatusError(401, 'Authentication required to access a library');
        }
        const libraries = await this.libraryRepository.getAllByUser(userId);
        if (!libraries) {
            throw new StatusError(404, 'No libraries found for this user');
        }

        const books = [];

        console.log("Libraries found: ", libraries.length)

        for (const library of libraries) {
            let libraryBooks = [];
            if (library.bookIds.length > 0) {
                for (const bookId of library.bookIds) {
                    const book = await this.bookService.getById(bookId);
                    if (book) {
                        libraryBooks.push(book);
                    } else {
                        console.warn(`Book with ID ${bookId} not found in the database.`);
                    }
                }
                library.books = libraryBooks;
            }
        }

        return libraries;
    }

    async addBookToUserLibrary(userId: any, title: string, book: any): Promise<Library> {

        if (!userId) {
            throw new StatusError(401, 'Authentication required to add a book to a library');
        }

        const originalBook = { ...book }; // Create a copy of the book object
        delete book.reviewCount;
        delete book.rating;

        // Check if the book exists
        try {
            const bookExists = await this.bookService.getById(book.bookId);
            if (!bookExists) {
                await this.bookService.create(book);
            }
        } catch (error) {
            await this.bookService.create(book);
        }

        // Remove the book from any other library of the same user
        const userLibraries = await this.libraryRepository.getAllByUser(userId);
        for (const lib of userLibraries) {
            if (lib.id !== title && lib.bookIds && lib.bookIds.includes(book.bookId)) {
                await this.libraryRepository.removeBook(userId, lib.title, book.bookId);
            }
        }


        const library = await this.libraryRepository.findByFields({ title: title , userId: userId });
        if (!library) {
            throw new StatusError(404, `Library with title "${title}" not found for user with ID "${userId}".`);
        }
        if (!library.bookIds) {
            library.bookIds = [];
        }
        // Check if the book is already in the user's library
        if (library.bookIds.includes(book.bookId)) {
            return library; // Book already exists in the library, no need to add it again
        }

        // Add the book to the user's library
        const result = await this.libraryRepository.addBook(userId, title, book.bookId);
        if (!result) {
            throw new StatusError(500, `Failed to add book with id "${book.bookId}" to the user's library.`);
        }

        return result;
    }

    async getBooksFromLibrary(userId: any, libraryId: any) {
        if (!userId) {
            throw new StatusError(401, 'Authentication required to access a library');
        }

        const library = await this.libraryRepository.findByFields({ id: libraryId, userId: userId });
        if (!library) {
            throw new StatusError(404, `Library with ID "${libraryId}" not found for user with ID "${userId}".`);
        }
        if (!library.bookIds || library.bookIds.length === 0) {
            return []; // No books in the library
        }
        const books = [];
        for (const bookId of library.bookIds) {
            const book = await this.bookService.getById(bookId);
            if (book) {
                books.push(book);
            } else {
                console.warn(`Book with ID ${bookId} not found in the database.`);
            }
        }
        return books;
    }

    async removeBookFromUserLibrary(userId: any, bookId: any) {
        if (!userId) {
            throw new StatusError(401, 'Authentication required to remove a book from a library');
        }

        // Check if the book exists in any library of the user
        const userLibraries = await this.libraryRepository.getAllByUser(userId);
        let foundLibrary = false;
        for (const lib of userLibraries) {
            if (lib.bookIds && lib.bookIds.includes(bookId)) {
                foundLibrary = true;
                await this.libraryRepository.removeBook(userId, lib.title, bookId);
            }
        }

        if (!foundLibrary) {
            throw new StatusError(404, `Book with ID "${bookId}" not found in any library for user with ID "${userId}".`);
        }

        return await this.getAllByUser(userId);
    }
}