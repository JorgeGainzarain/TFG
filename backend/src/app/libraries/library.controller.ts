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

        this.getRouter().use(this.verifyOwnership.bind(this));

        this.getRouter().get('/', this.getAllByUser.bind(this));
        this.getRouter().post('/', authenticateToken, this.addBookToUserLibrary.bind(this));
        this.getRouter().delete('/:bookId', authenticateToken, this.removeBook.bind(this));
    }

    private async verifyOwnership(req: any, res: any, next: any) {
        const userId = req.user?.id;
        const paramUserId = req.params.userId;

        // If userId is default return default libraries
        if (paramUserId === 'default') {
            const defaultLibraries = this.entityConfig.defaultEntities;
            const mappedLibraries = defaultLibraries.map((title: string, index: number) => ({ id: index, title }));

            res.status(200).json(createResponse('success', 'Default libraries retrieved successfully', mappedLibraries));
            return;
        }

        if (paramUserId && userId !== paramUserId) {
            next(new StatusError(403, 'Forbidden: You do not have access to this resource'));
        }
        next();
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

        let userId = req.params.userId;
        console.log('User ID from params:', userId);
        if (!userId) {
            userId = req.user?.id;
        }
        let title = req.body.title;
        const book = req.body.book;

        try {
            const updatedLibrary = await this.libraryService.addBookToUserLibrary(userId, title, book);
            res.status(200).json(createResponse('success', 'Libraries added successfully', updatedLibrary));
        } catch (error) {
            next(error);
        }
    }

}