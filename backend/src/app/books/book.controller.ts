import { Service } from 'typedi';
import { Book } from "./book.model";
import { BaseController } from "../base/base.controller";
import { config } from '../../config/environment';
import { BookService } from "./book.service";

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         bookId:
 *           type: string
 *         title:
 *           type: string
 *         authors:
 *           type: array
 *           items:
 *             type: string
 *         publishedDate:
 *           type: string
 *           format: date
 *         description:
 *           type: string
 *         pageCount:
 *           type: integer
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Categories'
 *         thumbnail:
 *           type: string
 *         language:
 *           type: string
 *         previewLink:
 *           type: string
 *         rating:
 *           type: number
 *           nullable: true
 *         reviewCount:
 *           type: integer
 *           nullable: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           nullable: true
 *     Categories:
 *       type: string
 *       enum:
 *         - ANTIQUES & COLLECTIBLES
 *         - LITERARY COLLECTIONS
 *         - ARCHITECTURE
 *         - LITERARY CRITICISM
 *         - ART
 *         - MATHEMATICS
 *         - BIBLES
 *         - MEDICAL
 *         - BIOGRAPHY & AUTOBIOGRAPHY
 *         - MUSIC
 *         - BODY, MIND & SPIRIT
 *         - NATURE
 *         - BUSINESS & ECONOMICS
 *         - PERFORMING ARTS
 *         - COMICS & GRAPHIC NOVELS
 *         - PETS
 *         - COMPUTERS
 *         - PHILOSOPHY
 *         - COOKING
 *         - PHOTOGRAPHY
 *         - CRAFTS & HOBBIES
 *         - POETRY
 *         - DESIGN
 *         - POLITICAL SCIENCE
 *         - DRAMA
 *         - PSYCHOLOGY
 *         - EDUCATION
 *         - REFERENCE
 *         - FAMILY & RELATIONSHIPS
 *         - RELIGION
 *         - FICTION
 *         - SCIENCE
 *         - GAMES & ACTIVITIES
 *         - SELF-HELP
 *         - GARDENING
 *         - SOCIAL SCIENCE
 *         - HEALTH & FITNESS
 *         - SPORTS & RECREATION
 *         - HISTORY
 *         - STUDY AIDS
 *         - HOUSE & HOME
 *         - TECHNOLOGY & ENGINEERING
 *         - HUMOR
 *         - TRANSPORTATION
 *         - JUVENILE FICTION
 *         - TRAVEL
 *         - JUVENILE NONFICTION
 *         - TRUE CRIME
 *         - LANGUAGE ARTS & DISCIPLINES
 *         - YOUNG ADULT FICTION
 *         - LANGUAGE STUDY
 *         - YOUNG ADULT NONFICTION
 *         - LAW
 */

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

    /**
     * @swagger
     * /books/trending:
     *   get:
     *     tags:
     *       - Books
     *     summary: Get top trending books by rating and review count
     *     responses:
     *       200:
     *         description: Trending books retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 message:
     *                   type: string
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Book'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getTrending(req: any, res: any, next: any): Promise<void> {
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

    /**
     * @swagger
     * /books:
     *   get:
     *     tags:
     *       - Books
     *     summary: Search for books
     *     parameters:
     *       - in: query
     *         name: q
     *         schema:
     *           type: string
     *         required: true
     *         description: Search query (title, keywords)
     *       - in: query
     *         name: orderBy
     *         schema:
     *           type: string
     *           enum: [relevance, newest]
     *         required: false
     *         description: Order results by relevance or newest
     *       - in: query
     *         name: category
     *         schema:
     *           $ref: '#/components/schemas/Categories'
     *         required: false
     *         description: Filter by category
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 0
     *         required: false
     *         description: Page number (pagination)
     *     responses:
     *       200:
     *         description: Books retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 message:
     *                   type: string
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Book'
     *       400:
     *         description: Search query is required or invalid
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: No books found matching the search criteria
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       503:
     *         description: Google Books API unavailable
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async search(req: any, res: any, next: any): Promise<void> {
        try {
            const searchQuery = req.query.q;
            if (!searchQuery) {
                res.status(400).json({ status: 'error', message: 'Search query is required', data: null });
                return;
            }

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

    /**
     * @swagger
     * /books/{id}:
     *   get:
     *     tags:
     *       - Books
     *     summary: Get book by internal database ID or Google Books ID
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: Book internal ID or Google Books ID
     *     responses:
     *       200:
     *         description: Book retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/Book'
     *       404:
     *         description: Book not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async getById(req: any, res: any, next: any): Promise<void> {
        try {
            const id = req.params.id;
            const book = await this.bookService.getById(id);
            res.status(200).json({
                status: 'success',
                message: 'Book retrieved successfully',
                data: book
            });
        } catch (error: any) {
            next(error);
        }
    }
}