import {Service} from 'typedi';
import {Library} from "./library.model";
import {BaseController} from "../base/base.controller";
import {config} from '../../config/environment';
import {LibraryService} from "./library.service";
import { authenticateToken } from "../../middleware/auth.middleware";
import {StatusError} from "../../utils/status_error";
import {createResponse} from "../../utils/response";
import {Library_BooksService} from "../library_books/library_books.service";

/**
 * @swagger
 * components:
 *   schemas:
 *     Library:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         userId:
 *           type: string
 *         title:
 *           type: string
 *         books:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Book'
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
 *             type: string
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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// noinspection DuplicatedCode
@Service()
export class LibraryController extends BaseController<Library> {
    protected entityConfig = config.entityValues.library;

    constructor(
        protected libraryService: LibraryService,
        protected library_BooksService: Library_BooksService
    ) {
        super(libraryService);

        this.getRouter().use(authenticateToken, this.verifyOwnership.bind(this));

        this.getRouter().get('/', this.getAllByUser.bind(this));
        this.getRouter().post('/:libraryId/books/', this.addBookToUserLibrary.bind(this));
        this.getRouter().delete('/:libraryId/books/:bookId', this.removeBook.bind(this));
    }

    /**
     * @swagger
     * /users/:userId/libraries:
     *   get:
     *     tags:
     *       - Libraries
     *     summary: Get all libraries for the authenticated user, optionally filtered by book or title
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: bookId
     *         schema:
     *           type: string
     *         required: false
     *         description: Filter libraries containing a specific book
     *       - in: query
     *         name: libraryTitle
     *         schema:
     *           type: string
     *         required: false
     *         description: Filter libraries by title
     *     responses:
     *       200:
     *         description: Libraries retrieved successfully
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
     *                     $ref: '#/components/schemas/Library'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: No libraries found
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
    private async getAllByUser(req: any, res: any, next: any) {
        const userId = req.user?.id;
        const params = {
            userId,
            bookId: req.query.bookId,
            title: req.query.libraryTitle
        };
        try {
            const libraries = await this.libraryService.getLibrariesByParams(params);
            res.status(200).json(createResponse('success', 'Libraries retrieved successfully', libraries));
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /users/:userId/libraries/{libraryId}/books:
     *   post:
     *     tags:
     *       - Libraries
     *     summary: Add a book to a user's library
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: libraryId
     *         schema:
     *           type: string
     *         required: true
     *         description: Library ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - book
     *             properties:
     *               book:
     *                 $ref: '#/components/schemas/Book'
     *     responses:
     *       200:
     *         description: Book added to library successfully
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
     *                   $ref: '#/components/schemas/Library'
     *       404:
     *         description: Library not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       409:
     *         description: Book already exists in library
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
    private async addBookToUserLibrary(req: any, res: any, next: any) {
        let libraryId = req.params.libraryId;
        const book = req.body.book;

        try {
            const existsLib = await this.libraryService.existsByFields({ id: libraryId });
            if (!existsLib) {
                throw new StatusError(404, `Library with ID "${libraryId}" not found.`);
            }
            const exists = await this.library_BooksService.existsByFields({
                libraryId: libraryId,
                bookId: book.bookId
            });
            if (exists) {
                throw new StatusError(409, `Book with ID "${book.bookId}" already exists in library "${libraryId}".`);
            }

            // Remove the book from any other library it is in
            const otherLibraryBooks = await this.library_BooksService.findByFields({ bookId: book.bookId });
            for (const lb of otherLibraryBooks) {
                if (lb.libraryId !== libraryId) {
                    await this.library_BooksService.delete(lb.id);
                }
            }

            await this.library_BooksService.create({
                libraryId: libraryId,
                bookId: book.bookId
            } as any)
            const updatedLibrary = await this.libraryService.getById(libraryId);
            res.status(200).json(createResponse('success', 'Libraries added successfully', updatedLibrary));
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /users/:userId/libraries/{libraryId}/books/{bookId}:
     *   delete:
     *     tags:
     *       - Libraries
     *     summary: Remove a book from a user's library
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: libraryId
     *         schema:
     *           type: string
     *         required: true
     *         description: Library ID
     *       - in: path
     *         name: bookId
     *         schema:
     *           type: string
     *         required: true
     *         description: Book ID
     *     responses:
     *       200:
     *         description: Book removed from library successfully
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
     *                   $ref: '#/components/schemas/Library'
     *       400:
     *         description: User ID and Book ID are required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Library not found
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
    private async removeBook(req: any, res: any, next: any) {
        const userId = req.user?.id;
        const libraryId = req.params.libraryId;
        const bookId = req.params.bookId;

        if (!userId || !bookId) {
            return next(new StatusError(400, 'User ID and Book ID are required'));
        }

        try {
            const exists = await this.libraryService.existsByFields({ id: libraryId });
            if (!exists) {
                throw new StatusError(404, `Library with ID "${libraryId}" not found.`);
            }
            let library_Books = await this.library_BooksService.findByFields({ libraryId, bookId });
            for (const lb of library_Books) {
                await this.library_BooksService.delete(lb.id);
            }
            const updatedLibrary = await this.libraryService.getById(libraryId);
            res.status(200).json(createResponse('success', 'Book removed successfully', updatedLibrary));
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /users/:userId/libraries:
     *   post:
     *     tags:
     *       - Libraries
     *     summary: Create a new library for the authenticated user
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - library
     *             properties:
     *               library:
     *                 type: object
     *                 required:
     *                   - title
     *                 properties:
     *                   title:
     *                     type: string
     *               bookIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Optional list of book IDs to add to the library
     *     responses:
     *       201:
     *         description: Library created successfully
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
     *                   $ref: '#/components/schemas/Library'
     *       400:
     *         description: Invalid request body
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
    async create(req: any, res: any, next: any) {
        const bookIds = req.body.bookIds || [];
        const library = req.body.library;
        try {
            const createdLibrary = await this.libraryService.create(library);
            if (bookIds.length > 0) {
                await Promise.all(
                    bookIds.map((bookId: any) =>
                        this.library_BooksService.create({
                            libraryId: createdLibrary.id,
                            bookId: bookId
                        } as any)
                    )
                );
            }
            res.status(201).json(createResponse('success', 'Library created successfully', createdLibrary));
        } catch (error) {
            next(error);
        }
    }

    private async verifyOwnership(req: any, res: any, next: any) {
        const userId = req.user?.id;
        const paramUserId = req.params.userId;

        if (paramUserId && String(userId) !== String(paramUserId)) {
            next(new StatusError(403, 'Forbidden: You do not have access to this resource'));
        }
        next();
    }
}