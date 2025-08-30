import { Library } from "./library.model";
import { Service } from 'typedi';
import { BaseRepository } from "../base/base.repository";
import { config } from "../../config/environment";
import { DatabaseService } from "../../database/database.service";

@Service()
export class LibraryRepository extends BaseRepository<Library> {
    protected entityConfig = config.entityValues.library;

    constructor(
        protected readonly databaseService: DatabaseService
    ) {
        super(databaseService);
    }

}