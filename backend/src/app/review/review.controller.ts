import { Service } from 'typedi';
import { ReviewService } from './review.service';
import { Review } from './review.model';
import { BaseController } from "../base/base.controller";
import { config } from '../../config/environment';
import {authenticateToken} from "../../middleware/auth.middleware";


// noinspection DuplicatedCode
@Service()
export class ReviewController extends BaseController<Review> {
    protected entityConfig = config.entityValues.review;

    constructor(
        protected reviewService: ReviewService
    ) {
        super(reviewService);

        this.getRouter().put('/:id', authenticateToken, this.update.bind(this));
        this.getRouter().post('/:bookId', authenticateToken, this.create.bind(this));
        this.getRouter().delete('/:id', authenticateToken, this.delete.bind(this));
        this.getRouter().get('/:bookId', this.getByBookId.bind(this));
    }

    async update(req: any, res: any, next: any): Promise<void> {
        // Ensure the user who is updating the review is the same as the one who created it
        const userId = req.user?.id;
        const ownerId = req.body.userId;
        if (userId !== ownerId) {
            return res.status(403).json({ message: 'You are not allowed to update this review.' });
        }
        return super.update(req, res, next);
    }

    async getByBookId(req: any, res: any, next: any): Promise<void> {
        try {
            const bookId = req.params.bookId;
            const reviews = await this.reviewService.getByBookId(bookId);
            res.status(200).json(reviews);
        } catch (error: any) {
            next(error);
        }
    }

    async create(req: any, res: any, next: any): Promise<void> {
        try {
            const bookId = req.params.bookId;
            const userId = req.user?.id;
            req.body.bookId = bookId;
            req.body.userId = userId;

            const createdReview = await this.reviewService.create(req.body);
            res.status(201).json(createdReview);
        } catch (error: any) {
            next(error);
        }
    }
}