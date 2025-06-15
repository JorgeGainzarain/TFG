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

        this.getRouter().post('/:bookId', this.create.bind(this));
        this.getRouter().get('/:id', this.getById.bind(this));
    }

    async create(req: any, res: any) {
        try {
            const bookId = parseInt(req.params.bookId, 10);
            const userId = req.user.id; // Assuming user ID is stored in req.user
            const { rating, comment } = req.body;

            const review: Review = {
                bookId,
                userId,
                rating,
                comment,
                likes: 0 // Likes start at 0 when creating the review
            };

            const createdReview = await this.reviewService.create(review);
            res.status(201).json(createdReview);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}