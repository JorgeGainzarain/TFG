import { Like } from "./like.model";
import { Service } from 'typedi';
import { BaseRepository } from "../base/base.repository";
import { config } from "../../config/environment";
import { DatabaseService } from "../../database/database.service";
import { StatusError } from "../../utils/status_error";

@Service()
export class LikeRepository extends BaseRepository<Like> {
    protected entityConfig = config.entityValues.like;

    constructor(
        protected readonly databaseService: DatabaseService
    ) {
        super(databaseService);
    }
}