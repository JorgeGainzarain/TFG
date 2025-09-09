import {Like} from "./like.model";
import { Service } from 'typedi';
import { BaseService } from "../base/base.service";
import { ReviewService} from "../reviews/review.service";
import { LikeRepository } from "./like.repository";
import { AuditService } from "../audit/audit.service";
import { config } from "../../config/environment";
import { StatusError } from "../../utils/status_error";
import {BookService} from "../books/book.service";

@Service()
export class LikeService extends BaseService<Like> {
    protected entityConfig = config.entityValues.like;

    constructor(
        protected auditService: AuditService,
        protected likeRepository: LikeRepository,
        protected reviewService: ReviewService,
    ) {
        super(
            auditService,
            likeRepository,
        );
    }

    async like(like: Like): Promise<number> {
        // Check if the like already exists
        const existingLikes = await this.likeRepository.findByFields({ userId: like.userId, reviewId: like.reviewId });
        if (existingLikes && existingLikes.length > 1) {
            throw new StatusError(500, 'Data integrity error: multiple likes found for the same user and review.');
        }
        const existingLike = existingLikes && existingLikes.length === 1 ? existingLikes[0] : undefined;
        if (existingLike) {
            // Unlike the review
            await this.likeRepository.deleteByFields({ userId: like.userId, reviewId: like.reviewId });
            return await this.reviewService.unlike(existingLike.reviewId);
        }
        else {
            // Create the new like
            await super.create(like);
            return await this.reviewService.like(like.reviewId)
        }
    }
}