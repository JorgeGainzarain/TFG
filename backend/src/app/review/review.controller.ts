import { Service } from 'typedi';
import { ReviewService } from './review.service';
import { Review } from './review.model';
import { BaseController } from "../base/base.controller";
import { config } from '../../config/environment';
import { authenticateJWT } from '../../middleware/authentificate_JWT';
import {authenticateToken} from "../../middleware/auth.middleware";


// noinspection DuplicatedCode
@Service()
export class ReviewController extends BaseController<Review> {
    protected entityConfig = config.entityValues.review;


    constructor(
        protected reviewService: ReviewService
    ) {
        super(reviewService);

        this.getRouter().use(authenticateToken)

        this.getRouter().post('/:bookId', this.create.bind(this));
        this.getRouter().get('/:bookId', this.getByBookId.bind(this));
    }

    async getByBookId(req: any, res: any) {
        try {
            const bookId = req.params.bookId;
            const reviews = await this.reviewService.getByBookId(bookId);
            res.status(200).json(reviews);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: any, res: any) {
        try {
            const bookId = req.params.bookId;
            const userId = req.user?.id;
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