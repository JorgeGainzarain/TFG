import {Service} from 'typedi';
import {Library} from "./library.model";
import {BaseController} from "../base/base.controller";
import {config} from '../../config/environment';
import {LibraryService} from "./library.service";
import { authenticateToken } from "../../middleware/auth.middleware";
import {StatusError} from "../../utils/status_error";
import {createResponse} from "../../utils/response";
import {Library_BooksService} from "../library_books/library_books.service";


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

    private async verifyOwnership(req: any, res: any, next: any) {
        const userId = req.user?.id;
        const paramUserId = req.params.userId;

        if (paramUserId && String(userId) !== String(paramUserId)) {
            console.log(`User ID from token: ${userId}, User ID from params: ${paramUserId}`);
            next(new StatusError(403, 'Forbidden: You do not have access to this resource'));
        }
        next();
    }

    async create(req: any, res: any, next: any) {
        const bookIds = req.body.bookIds || [];
        const library = req.body.library;
        // Execute both promises concurrently and if any fails, process error and abort
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

    private async getAllByUser(req: any, res: any, next: any) {
        const userId = req.user?.id;
        const params = {
            userId,
            bookId: req.query.bookId,
            title: req.query.libraryTitle
        };
        console.log('Fetching libraries with params:', params);
        try {
            const libraries = await this.libraryService.getLibrariesByParams(params);
            res.status(200).json(createResponse('success', 'Libraries retrieved successfully', libraries));
        } catch (error) {
            next(error);
        }
    }

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

            console.log('Adding book to library:', { libraryId, bookId: book.bookId });
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

}