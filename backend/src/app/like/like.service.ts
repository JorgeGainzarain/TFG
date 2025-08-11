import {Like} from "./like.model";
import { Service } from 'typedi';
import { BaseService } from "../base/base.service";
import { ReviewService} from "../review/review.service";
import { LikeRepository } from "./like.repository";
import { AuditService } from "../audit/audit.service";
import { config } from "../../config/environment";
import { StatusError } from "../../utils/status_error";
import {BookService} from "../book/book.service";

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
        const existingLike = await this.likeRepository.findByFields({ userId: like.userId, reviewId: like.reviewId });
        if (existingLike) {
            // Unlike the review
            if (existingLike.id === undefined) {
                throw new StatusError(400, "Like ID is undefined");
            }
            await this.delete(existingLike.id);
            return await this.reviewService.unlike(existingLike.reviewId);
        }
        else {
            // Create the new like
            await super.create(like);
            return await this.reviewService.like(like.reviewId)
        }
    }
}