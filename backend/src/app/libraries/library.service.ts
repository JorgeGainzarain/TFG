import { Library} from "./library.model";
import { Service } from 'typedi';
import { BaseService } from "../base/base.service";
import { LibraryRepository } from "./library.repository";
import { AuditService } from "../audit/audit.service";
import { config } from "../../config/environment";
import { StatusError } from "../../utils/status_error";
import {BookService} from "../books/book.service";
import {Library_BooksService} from "../library_books/library_books.service";

@Service()
export class LibraryService extends BaseService<Library> {
    protected entityConfig = config.entityValues.library;

    constructor(
        protected auditService: AuditService,
        protected libraryRepository: LibraryRepository,
        protected bookService: BookService,
        protected library_BooksService: Library_BooksService,
    ) {
        super(
            auditService,
            libraryRepository,
        );
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

    async getLibrariesByParams(params: { userId: any; bookId: any; title: any }) {
        if (!params.userId) {
            throw new StatusError(401, 'Authentication required to access a library');
        }

        // Call to getByFields with the provided parameters
        const libraries = await this.libraryRepository.findByFields({
            userId: params.userId,
            title: params.title
        })
        if (!libraries || libraries.length === 0) {
            throw new StatusError(404, 'No libraries found matching the provided parameters');
        }

        // For each library, fetch associated books and add them as a 'books' property
        for (const library of libraries) {
            const library_Books = await this.library_BooksService.findByFields({
                libraryId: library.id,
                bookId: params.bookId
            });
            console.log("Library: ", library);
            console.log('Library_Books entries:', library_Books);
            let bookIds = [];
            for (const lb of library_Books) {
                bookIds.push(lb.bookId);
            }
            console.log('Book IDs to fetch:', bookIds);
            let books = [];
            for (const id of bookIds) {
                // Fetch book from BookService and add to books array
                const book = await this.bookService.findByFields({ bookId: id })
                if (book && book.length > 0) {
                    books.push(book[0]);
                }
            }
            (library as any).books = books;
        }
        console.log('Libraries with books:', libraries);
        return libraries;
    }
}