import {Service} from 'typedi';
import {Library} from "./library.model";
import {BaseController} from "../base/base.controller";
import {config} from '../../config/environment';
import {LibraryService} from "./library.service";


// noinspection DuplicatedCode
@Service()
export class LibraryController extends BaseController<Library> {
    protected entityConfig = config.entityValues.library;


    constructor(
        protected libraryService: LibraryService
    ) {
        super(libraryService);
        this.getRouter().get('/:userId/', this.getAllByUser.bind(this));
        this.getRouter().post('/:userId', this.create.bind(this));
        this.getRouter().post('/:userId/:bookId', this.addBookToUserLibrary.bind(this));
    }

    async create(req: any, res: any, next: any) {
        req.body.userId = req.params.userId;
        console.log("User ID from request params:", req.body.userId);
        return await super.create(req, res, next)
    }

    private async getAllByUser(req: any, res: any, next: any) {
        const userId = req.params.userId;
        try {
            const libraries = await this.libraryService.getAllByUser(userId);
            res.status(200).json(libraries);
        } catch (error) {
            next(error);
        }
    }

    private async addBookToUserLibrary(req: any, res: any, next: any) {
        const userId = req.params.userId;
        const book = req.body; // Assuming book details are sent in the request body
        book.bookId = req.params.bookId;
        const title = "Mi Biblioteca" // Temporal to test things
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        try {
            const updatedLibrary = await this.libraryService.addBookToUserLibrary(userId, title, book);
            res.status(200).json(updatedLibrary);
        } catch (error) {
            next(error);
        }
    }
}