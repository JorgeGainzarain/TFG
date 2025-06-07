import { Book} from "./book.model";
import { Service } from 'typedi';
import { BaseRepository } from "../base/base.repository";
import { config } from "../../config/environment";
import { DatabaseService } from "../../database/database.service";
import { StatusError } from "../../utils/status_error";


@Service()
export class BookRepository extends BaseRepository<Book> {
    protected entityConfig = config.entityValues.book;

    constructor(
        protected readonly databaseService: DatabaseService
    ) {
        super(databaseService);
    }
}