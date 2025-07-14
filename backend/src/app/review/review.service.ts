import {Service} from "typedi";
import {AuditService} from "../audit/audit.service";
import {Review} from "./review.model";
import {ReviewRepository} from "./review.repository";
import {BaseService} from "../base/base.service";
import {config} from "../../config/environment";
import {BookService} from "../book/book.service";
import {validateObject} from "../../utils/validation";
import {StatusError} from "../../utils/status_error";
import {UserService} from "../user/user.service";

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

    async getByBookId(bookId: string) {
        let reviews = await this.reviewRepository.getByBookId(bookId);
        for (const review of reviews) {
            // Add the book and user as fields from their id's
            const book = await this.bookService.getById(review.bookId);
            const user = await this.userService.getById(review.userId);
            review.book = book;
            review.user = user;
        }
        console.log("Reviews for book with ID:", bookId, reviews);
        return reviews
    }
}