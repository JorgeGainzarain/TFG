import { Library_Book} from "./library_books.model";
import { config } from "../../config/environment";
import {BaseRepository} from "../base/base.repository";
import {Service} from "typedi";
import {DatabaseService} from "../../database/database.service";

@Service()
export class Library_BooksRepository extends BaseRepository<Library_Book> {
    protected entityConfig = config.entityValues.library_books;

    constructor(
        protected readonly databaseService: DatabaseService
    ) {
        super(databaseService);
    }
}