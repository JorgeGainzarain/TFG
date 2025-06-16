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
        if (!part_entity.userId) {
            throw new StatusError(401, 'Authentication required to create a library');
        }
        console.log("Creating library with data:", part_entity);
        // Set the BookIds to a empty array if not provided
        if (!part_entity.bookIds) {
            part_entity.bookIds = [];
        }
        console.log("Library data after setting bookIds:", part_entity);
        return await super.create(part_entity);
    }

    async getAllByUser(userId: number): Promise<Library[]> {
        if (!userId) {
            throw new StatusError(401, 'Authentication required to access a library');
        }
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

    async addBookToUserLibrary(userId: any, title: string, book: any): Promise<Library> {

        if (!userId) {
            throw new StatusError(401, 'Authentication required to add a book to a library');
        }

        console.log("Adding book to user:", userId);
        console.log("Book data:", book);

        // Check if the book exists
        const bookExists = await this.bookService.existsByFields(book);
        console.log("Book exists:", bookExists);
        if (!bookExists) {
            await this.bookService.create(book);
        }

        const library = await this.libraryRepository.findByFields({ title: title , userId: userId });
        console.log("Library retrieved:", library);
        if (!library) {
            throw new StatusError(404, `Library with title "${title}" not found for user with ID "${userId}".`);
        }
        if (!library.bookIds) {
            library.bookIds = [];
        }
        console.log("BookId:", book.bookId);
        console.log("Includes:", library.bookIds.includes(book.bookId));
        // Check if the book is already in the user's library
        if (library.bookIds.includes(book.bookId)) {
            return library; // Book already exists in the library, no need to add it again
        }
        console.log("Control 2");

        // Add the book to the user's library
        const result = await this.libraryRepository.addBook(userId, title, book.bookId);
        if (!result) {
            throw new StatusError(500, `Failed to add book with id "${book.bookId}" to the user's library.`);
        }

        return result;
    }
}