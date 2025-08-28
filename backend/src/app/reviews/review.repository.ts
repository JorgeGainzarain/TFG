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

    async getByBookId(bookId: string): Promise<Review[]> {
        const queryDoc = {
            sql: `SELECT * FROM ${this.entityConfig.table_name} WHERE bookId = ?`,
            params: [bookId]
        };


        const result = await this.databaseService.execQuery(queryDoc);

        if (!result || !result.rows || result.rows.length === 0) {
            return [];
        }

        return result.rows;
    }
}