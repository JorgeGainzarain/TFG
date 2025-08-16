import { Service } from 'typedi';
import { Book} from "./book.model";
import { BaseController } from "../base/base.controller";
import { config } from '../../config/environment';
import { authenticateJWT } from '../../middleware/authentificate_JWT';
import {BookService} from "./book.service";



// noinspection DuplicatedCode
@Service()
export class BookController extends BaseController<Book> {
    protected entityConfig = config.entityValues.book;


    constructor(
        protected bookService: BookService
    ) {
        super(bookService);

        this.getRouter().get('/:id', this.getById.bind(this));
        this.getRouter().get('/', this.search.bind(this));
    }

    async search(req: any, res: any, next: any): Promise<void> {
        try {
            const searchQuery = req.query.q;
            if (!searchQuery) {
                res.status(400).json({ message: 'Search query is required' });
                return;
            }

            // Extract optional prameters from body, like orderBy and maxResults
            const orderBy = req.query.orderBy;
            const maxResults = parseInt(req.query.maxResults);

            const books = await this.bookService.searchBooks(searchQuery, orderBy, maxResults);
            res.status(200).json({
                status: 'success',
                message: 'Books retrieved successfully',
                data: books
            });
        } catch (error: any) {
            next(error);
        }
    }
}