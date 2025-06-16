import {Book, Categories} from "./book.model";
import { Service } from 'typedi';
import { BaseRepository } from "../base/base.repository";
import { config } from "../../config/environment";
import { DatabaseService } from "../../database/database.service";
import { StatusError } from "../../utils/status_error";


@Service()
export class BookRepository extends BaseRepository<Book> {
    protected entityConfig = config.entityValues.book;

    constructor(
        protected readonly databaseService: DatabaseService
    ) {
        super(databaseService);
    }

    async findAll(): Promise<Book[]> {
        const books = await super.findAll();
        return Promise.all(books.map((book) => this.process(book)));
    }

    async findByFields(fields: Partial<Book>): Promise<Book | undefined> {
        const book = await super.findByFields(fields);
        if (!book) {
            return undefined;
        }
        return await this.process(book);
    }

    async findById(id: number): Promise<Book> {
        const book = await super.findById(id);
        if (!book) {
            throw new StatusError(404, `Book with ID "${id}" not found.`);
        }
        return await this.process(book);
    }

    async create(book: Book): Promise<any> {
        console.log("Book before process: ", book);
        book = await this.process(book);
        console.log("Book after process: ", book);
        return await super.create(book);
    }

    async update(id: number, book: Partial<Book>): Promise<Book> {
        book = await this.process(book as Book);
        return await super.update(id, book);
    }

    async process(book: Book): Promise<Book> {
        if (book.authors) {
            if (Array.isArray(book.authors)) {
                book.authors = book.authors.join(', ');
            } else if (typeof book.authors === 'string') {
                book.authors = book.authors.split(',').map(author => author.trim());
            } else if (typeof book.authors === 'object') {
                // Handle object structure like { '0': 'Author Name', '1': 'Another Author' }
                book.authors = Object.values(book.authors).join(', ');
            }
        }

        if (book.categories) {
            if (Array.isArray(book.categories)) {
                book.categories = book.categories.join(', ');
            } else if (typeof book.categories === 'string') {
                book.categories = book.categories.split(',').map(category => category.trim()) as Categories[];
            } else if (typeof book.categories === 'object') {
                // Handle object structure like { '0': 'ABUSO SEXUAL', '1': 'VIOLENCIA' }
                book.categories = Object.values(book.categories).join(', ') as unknown as Categories[];
            }
        }

        return book;
    }
}