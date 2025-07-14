import { Book, Categories } from "./book.model";
import { Service } from 'typedi';
import { BaseService } from "../base/base.service";
import { BookRepository } from "./book.repository";
import { AuditService } from "../audit/audit.service";
import { config } from "../../config/environment";
import { StatusError } from "../../utils/status_error";
import {ReviewRepository} from "../review/review.repository";
import {validateObject} from "../../utils/validation";

@Service()
export class BookService extends BaseService<Book> {
    protected entityConfig = config.entityValues.book;

    constructor(
        protected auditService: AuditService,
        protected bookRepository: BookRepository,
        protected reviewRepository: ReviewRepository
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

    async create(part_entity: Partial<Book>): Promise<Book> {
        let book = validateObject(part_entity, this.entityConfig.requiredFields);
        console.log("Book: ", book);
        const bookExists = await this.bookRepository.exists({ bookId: book.bookId });
        if (bookExists) {
            throw new StatusError(409, `Book with ID "${book.bookId}" already exists.`);
        }
        console.log("Book: ", book.toString());
        return await super.create(book);
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

            for (let book of books) {
                if (!book.authors) {
                    book.authors = [];
                }
                else if (book.authors.length > 1) {
                    book.authors = book.authors.map((author: string) => author.trim());
                }
                if (book.author) {
                    book.authors.push(book.author);
                }
                // Retrieve the book from the database if it exists to see the rating and number of reviews, otherwise set it to 0
                const reviews = await this.reviewRepository.getByBookId(book.bookId)
                console.log(reviews);
                book.reviewCount = reviews.length
                book.rating = reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / (reviews.length || 1);
                console.log("Reviews for book: " +  book.bookId + " -> " + reviews)}

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