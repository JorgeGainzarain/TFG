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
        this.getRouter().use(authenticateToken);

        this.getRouter().get('/', this.getAllByUser.bind(this));
        this.getRouter().post('/', this.create.bind(this));
        this.getRouter().post('/:bookId', this.addBookToUserLibrary.bind(this));
    }

    async create(req: any, res: any, next: any) {
        req.body.userId = req.user?.id;
        return await super.create(req, res, next)
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
        const userId = req.user?.id;
        const book = req.body; // Assuming book details are sent in the request body
        book.bookId = req.params.bookId;
        const title = "Mi Biblioteca" // Temporal to test things
        try {
            const updatedLibrary = await this.libraryService.addBookToUserLibrary(userId, title, book);
            res.status(200).json(createResponse('success', 'Libraries added successfully', updatedLibrary));
        } catch (error) {
            next(error);
        }
    }
}