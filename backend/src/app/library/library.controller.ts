import {Service} from 'typedi';
import {Library} from "./library.model";
import {BaseController} from "../base/base.controller";
import {config} from '../../config/environment';
import {LibraryService} from "./library.service";
import { authenticateToken } from "../../middleware/auth.middleware";
import {StatusError} from "../../utils/status_error";
import {createResponse} from "../../utils/response";


// noinspection DuplicatedCode
@Service()
export class LibraryController extends BaseController<Library> {
    protected entityConfig = config.entityValues.library;


    constructor(
        protected libraryService: LibraryService
    ) {
        super(libraryService);

        this.getRouter().get('/', authenticateToken, this.getAllByUser.bind(this));
        this.getRouter().post('/:libraryId/', authenticateToken, this.addBookToUserLibrary.bind(this));
        this.getRouter().post("/", authenticateToken, this.createDefaultLibraries.bind(this));
        this.getRouter().get("/default", this.getDefaultLibraries.bind(this));
        this.getRouter().delete('/:bookId', authenticateToken, this.removeBook.bind(this));
    }

    private async removeBook(req: any, res: any, next: any) {
        const userId = req.user?.id;
        const bookId = req.params.bookId;

        if (!userId || !bookId) {
            return next(new StatusError(400, 'User ID and Book ID are required'));
        }

        try {
            const updatedLibrary = await this.libraryService.removeBookFromUserLibrary(userId, bookId);
            res.status(200).json(createResponse('success', 'Book removed successfully', updatedLibrary));
        } catch (error) {
            next(error);
        }
    }

    private async getAllByUser(req: any, res: any, next: any) {
        const userId = req.user?.id;
        try {
            const libraries = await this.libraryService.getAllByUser(userId);
            res.status(200).json(createResponse('success', 'Libraries retrieved successfully', libraries));
        } catch (error) {
            next(error);
        }
    }

    private async addBookToUserLibrary(req: any, res: any, next: any) {
        const title = req.params.libraryId;

        if(title == "default") {
            return await this.createDefaultLibraries(req, res, next);
        }

        const userId = req.user?.id;
        const book = req.body; // Assuming book details are sent in the request body

        try {
            const updatedLibrary = await this.libraryService.addBookToUserLibrary(userId, title, book);
            res.status(200).json(createResponse('success', 'Libraries added successfully', updatedLibrary));
        } catch (error) {
            next(error);
        }
    }

    async createDefaultLibraries(req: any, res: any, next: any) {
        const userId = req.user?.id;
        try {
            const libraries = await this.libraryService.createDefaultLibraries(userId);
            res.status(201).json(createResponse('success', 'Default libraries created successfully', libraries));
        } catch (error) {
            next(error);
        }
    }

    async getDefaultLibraries(req: any, res: any, next: any) {
        try {
            const defaultLibraries = this.entityConfig.defaultEntities;
            if (!defaultLibraries || defaultLibraries.length === 0) {
                throw new StatusError(404, 'No default libraries found');
            }
            res.status(200).json(createResponse('success', 'Default libraries retrieved successfully', defaultLibraries));
        } catch (error) {
            next(error);
        }
    }
}