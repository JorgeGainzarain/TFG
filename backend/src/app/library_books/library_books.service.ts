import {Library_Book} from "./library_books.model";
import {AuditService} from "../audit/audit.service";
import {BaseService} from "../base/base.service";
import { config } from "../../config/environment";
import {Library_BooksRepository} from "./library_books.repository";
import {Service} from "typedi";
import {BookService} from "../books/book.service";

@Service()
export class Library_BooksService extends BaseService<Library_Book> {
    protected entityConfig = config.entityValues.library_books;

    constructor(
        protected auditService: AuditService,
        protected library_BooksRepository: Library_BooksRepository,
        protected bookService: BookService,
    ) {
        super(
            auditService,
            library_BooksRepository,
        );
    }

    async create(entity: Library_Book): Promise<Library_Book> {
        const exists = await this.bookService.existsByFields({ bookId: entity.bookId });
        if (!exists) {
            const books = await this.bookService.searchBooks('', 'relevance', 0, '', entity.bookId);
            if (books.length === 0) {
                throw new Error(`Book with ID "${entity.bookId}" not found in external source.`);
            }
            const book = books[0];
            await this.bookService.create(book);
        }
        return super.create(entity);
    }
}