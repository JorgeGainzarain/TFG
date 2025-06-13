import { Book, Categories } from "./book.model";
import { Service } from 'typedi';
import { BaseService } from "../base/base.service";
import { BookRepository } from "./book.repository";
import { AuditService } from "../audit/audit.service";
import { config } from "../../config/environment";
import { validateObject } from "../../utils/validation";
import { StatusError } from "../../utils/status_error";
import { validatePartialObject } from "../../utils/validation";

@Service()
export class BookService extends BaseService<Book> {
    protected entityConfig = config.entityValues.book;

    constructor(
        protected auditService: AuditService,
        protected bookRepository: BookRepository
    ) {
        super(auditService, bookRepository);
    }

    async getById(id: string | number): Promise<Book> {
        if (typeof id == 'number') {
            return await super.getById(id);
        }
        else {
            const book = await this.bookRepository.findByFields( { bookId: id })
            if (!book) {
                throw new StatusError(404, `Book with ID "${id}" not found.`);
            }
            else {
                return book;
            }
        }
    }

    public async searchBooks(searchQuery: string): Promise<Book[]> {
        if (!searchQuery || searchQuery.trim() === '') {
            throw new StatusError(400, 'Search query cannot be empty');
        }

        const maxResults = 12;
        const startIndex = 0;
        const orderBy = 'relevance';
        const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
        const API_KEY = config.googleBooksApiKey;

        let apiUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&startIndex=${startIndex}&orderBy=${orderBy}`;

        if (API_KEY) {
            apiUrl += `&key=${API_KEY}`;
        }

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Google Books API error: ${response.statusText}`);
            }

            const data = await response.json();
            const books = data.items ? data.items.map(this.formatBookData) : [];

            if (books.length === 0) {
                throw new StatusError(404, 'No books found matching the search criteria');
            }

            // If there's only one author add it to the "authors" array
            books.forEach((book: any) => {
                if (!book.authors) {
                    book.authors = [];
                }
                else if (book.authors.length > 1) {
                    book.authors = book.authors.map((author: string) => author.trim());
                }
                if (book.author) {
                    book.authors.push(book.author);
                }
            });

            return books;
        } catch (error: any) {
            throw new StatusError(503, error.message || 'Google Books API is currently unavailable');
        }
    }

    private formatBookData(item: any): Book {
        return {
            bookId: item.id,
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || [],
            publishedDate: new Date(item.volumeInfo.publishedDate || ''),
            description: item.volumeInfo.description || '',
            pageCount: item.volumeInfo.pageCount || 0,
            categories: item.volumeInfo.categories || [] as Categories[],
            thumbnail : item.volumeInfo.imageLinks?.thumbnail || '',
            language: item.volumeInfo.language || '',
            previewLink: item.volumeInfo.previewLink || ''
        } as Book;
    }

}