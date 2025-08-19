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

        this.getRouter().get('/trending', this.getTrending.bind(this));
        this.getRouter().get('/:id', this.getById.bind(this));
        this.getRouter().get('/', this.search.bind(this));
    }

    async getTrending(req: any, res: any, next: any): Promise<void> {
        console.log("Fetching trending book...");
        try {
            const books = await this.bookService.getTrendingBooks();
            res.status(200).json({
                status: 'success',
                message: 'Trending books retrieved successfully',
                data: books
            });
        } catch (error: any) {
            next(error);
        }
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
            const category = req.query.category;
            const page = parseInt(req.query.page) || 0;

            const books = await this.bookService.searchBooks(searchQuery, orderBy, page, category);
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