import {Service} from "typedi";
import {AuditService} from "../audit/audit.service";
import {Review} from "./review.model";
import {ReviewRepository} from "./review.repository";
import {BaseService} from "../base/base.service";
import {config} from "../../config/environment";
import {BookService} from "../books/book.service";
import {validateObject} from "../../utils/validation";
import {StatusError} from "../../utils/status_error";
import {UserService} from "../auth/user.service";

@Service()
export class ReviewService extends BaseService<Review> {
    protected entityConfig = config.entityValues.review;

    constructor(
        protected auditService: AuditService,
        protected reviewRepository: ReviewRepository,
        protected  bookService: BookService,
        protected userService: UserService
    ) {
        super(auditService, reviewRepository);
    }

    async create(review: Review) {
        if (!review.likes) {
            review.likes = 0;
        }
        validateObject(review, this.entityConfig.requiredFields);
        const book = review.book;
        if (book) {
            const bookExists = await this.bookService.existsByFields({ bookId: book.bookId });
            if (!bookExists) {
                await this.bookService.create(book);
            }
            // Remove the book field from the review before saving
            delete review.book;
        }
        const reviewExists = await this.reviewRepository.exists({ bookId: review.bookId, userId: review.userId });
        if (reviewExists) {
            throw new StatusError(409, `Review for book with ID "${review.bookId}" by user with ID "${review.userId}" already exists.`);
        }
        return await super.create(review);
    }

    async like(id: number) {
        const review = await this.reviewRepository.findById(id);
        if (!review) {
            throw new StatusError(404, `Review with ID "${id}" not found.`);
        }
        review.likes = (review.likes || 0) + 1;
        await this.update(id, review);
        return review.likes;
    }

    async unlike(id: number) {
        const review = await this.reviewRepository.findById(id);
        if (!review) {
            throw new StatusError(404, `Review with ID "${id}" not found.`);
        }
        if (review.likes && review.likes > 0) {
            review.likes -= 1;
        } else {
            throw new StatusError(400, `Cannot unlike review with ID "${id}" as it has no likes.`);
        }
        await this.update(id, review);
        return review.likes;
    }

    async update(id: number, review: Review) {
        if (review.user && !review.userId) {
            if (review.user.id != null) {
                review.userId = review.user.id;
            }
        }
        if (review.book && !review.bookId) {
            if (review.book.bookId != null) {
                review.bookId = review.book.bookId;
            }
        }

        delete review.book;
        delete review.user;
        return super.update(id, review);
    }

    async getByBookId(bookId: string) {
        let reviews = await this.reviewRepository.getByBookId(bookId);
        for (const review of reviews) {
            // Add the book and user as fields from their id's
            const book = await this.bookService.getById(review.bookId);
            const user = await this.userService.getById(review.userId);
            review.book = book;
            review.user = user;
        }
        return reviews
    }
}