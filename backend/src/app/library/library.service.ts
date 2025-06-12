import { Library} from "./library.model";
import { Service } from 'typedi';
import { BaseService } from "../base/base.service";
import { LibraryRepository } from "./library.repository";
import { AuditService } from "../audit/audit.service";
import { config } from "../../config/environment";
import { StatusError } from "../../utils/status_error";
import {BookService} from "../book/book.service";
import {Book} from "../book/book.model";
import {validateObject, validatePartialObject} from "../../utils/validation";

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
        console.log("Creating library with data:", part_entity);
        // Set the BookIds to a empty array if not provided
        if (!part_entity.bookIds) {
            part_entity.bookIds = [];
        }
        console.log("Library data after setting bookIds:", part_entity);
        return await super.create(part_entity);
    }

    async getAllByUser(userId: number) {
        console.log("Retrieving all libraries for user with ID:", userId);
        const libraries = await this.libraryRepository.getAllByUser(userId);
        console.log("Libraries retrieved:", libraries);
        if (!libraries) {
            throw new StatusError(404, 'No libraries found for this user');
        }

        const books = [];

        for (const library of libraries) {
            if (library.bookIds.length > 0) {
                console.log("Library has books, retrieving book details:", library.bookIds);
                for (const bookId of library.bookIds) {
                    const book = await this.bookService.getById(bookId);
                    if (book) {
                        books.push(book);
                    } else {
                        console.warn(`Book with ID ${bookId} not found in the database.`);
                    }
                }
                library.books = books;
            }
        }

        console.log("Final libraries with books:", libraries);

        return libraries;
    }

    async addBookToUserLibrary(userId: any, title: string, book: any): Promise<void> {

        console.log("Adding book to user's library with data:", { userId, title, book });

        //validatePartialObject(book, this.bookEntityConfig.requiredFields);

        console.log("Control 0");

        // Check if the book exists
        const bookExists = await this.bookService.existsByFields(book);
        if (!bookExists) {
            await this.bookService.create(book);
        }

        console.log("Control 1");

        // Add the book to the user's library
        const result = await this.libraryRepository.addBook(userId, title, book.bookId);
        if (!result) {
            throw new StatusError(500, `Failed to add book with id "${book.bookId}" to the user's library.`);
        }

        console.log("Control 2");
    }
}