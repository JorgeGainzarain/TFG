import { Service } from 'typedi';
import { Library} from "./library.model";
import { BaseController } from "../base/base.controller";
import { config } from '../../config/environment';
import { authenticateJWT } from '../../middleware/authentificate_JWT';
import { LibraryService } from "./library.service";



// noinspection DuplicatedCode
@Service()
export class LibraryController extends BaseController<Library> {
    protected entityConfig = config.entityValues.library;


    constructor(
        protected libraryService: LibraryService
    ) {
        super(libraryService);
        this.getRouter().use(authenticateJWT);
        this.getRouter().get('/:id', this.getById.bind(this));
        this.getRouter().get('/:userId/', this.getAllByUser.bind(this));
        this.getRouter().post('/:userId/:bookId', this.addBookToUserLibrary.bind(this));
    }

    private async getAllByUser(req: any, res: any) {
        const userId = req.params.userId;
        try {
            const libraries = await this.libraryService.getAllByUser(userId);
            res.status(200).json(libraries);
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve books' });
        }
    }

    private async addBookToUserLibrary(req: any, res: any) {
        const userId = req.params.userId;
        const bookId = req.params.bookId;
        const title = req.body.title;
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        try {
            const updatedLibrary = await this.libraryService.addBookToUserLibrary(userId, title, bookId);
            res.status(200).json(updatedLibrary);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add book to library' });
        }
    }
}