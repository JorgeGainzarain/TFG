import { Service } from 'typedi';
import { DatabaseService } from '../../database/database.service';
import { Review} from "./review.model";
import { BaseRepository } from '../base/base.repository';
import { config } from '../../config/environment';


@Service()
export class ReviewRepository extends BaseRepository<Review> {
    protected entityConfig = config.entityValues.review;

    constructor(
        protected readonly databaseService: DatabaseService
    ) {
        super(databaseService);
    }
}