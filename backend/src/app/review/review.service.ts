import { Service } from "typedi";
import { AuditService } from "../audit/audit.service";
import { Review} from "./review.model";
import { ReviewRepository } from "./review.repository";
import { BaseService } from "../base/base.service";
import {config} from "../../config/environment";

@Service()
export class ReviewService extends BaseService<Review> {
    protected entityConfig = config.entityValues.review;

    constructor(
        protected auditService: AuditService,
        protected reviewRepository: ReviewRepository,
    ) {
        super(auditService, reviewRepository);
    }

}