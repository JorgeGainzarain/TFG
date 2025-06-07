import { Service } from 'typedi';
import { ReviewService } from './review.service';
import { Review } from './review.model';
import { BaseController } from "../base/base.controller";
import { config } from '../../config/environment';
import { authenticateJWT } from '../../middleware/authentificate_JWT';


// noinspection DuplicatedCode
@Service()
export class ReviewController extends BaseController<Review> {
    protected entityConfig = config.entityValues.review;


    constructor(
        protected reviewService: ReviewService
    ) {
        super(reviewService);

        this.getRouter().use(authenticateJWT)

        this.getRouter().post('/', this.create.bind(this));
        this.getRouter().get('/:id', this.getById.bind(this));
    }
}