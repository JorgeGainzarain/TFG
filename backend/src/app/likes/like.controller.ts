import {Service} from 'typedi';
import {Like} from "./like.model";
import {BaseController} from "../base/base.controller";
import {config} from '../../config/environment';
import {LikeService} from "./like.service";
import {authenticateToken} from "../../middleware/auth.middleware";

// noinspection DuplicatedCode
@Service()
export class LikeController extends BaseController<Like> {
    protected entityConfig = config.entityValues.like;


    constructor(
        protected likeService: LikeService
    ) {
        super(likeService);

        this.getRouter().post('/', authenticateToken, this.like.bind(this));
        this.getRouter().get('/me', authenticateToken, this.isLiked.bind(this));
    }

    async isLiked(req: any, res: any, next:any): Promise<void> {
        const userId = req.user?.id;
        const reviewId = req.params.reviewId;

        try {
            let like;
            // Validate if a like exists for the user and review
            if (!userId || !reviewId) {
                console.log("Invalid like check request: userId or reviewId is missing");
                console.log("userId:", userId, "reviewId:", reviewId);
                like = false;
            }
            else {
                like = await this.likeService.existsByFields({userId: userId, reviewId: reviewId});
            }
            console.log("Like check result:", like);
            if (like) {
                res.status(200).send({liked: true});
            } else {
                res.status(200).send({liked: false});
            }
        } catch (error) {
            next(error);
        }
    }

    async like(req: any, res: any, next: any): Promise<void> {
        const reviewId = req.params.reviewId;
        const userId = req.user?.id;

        // Validate the like object
        if (!userId || !reviewId) {
            console.log("Invalid like request: userId or reviewId is missing");
            console.log("userId:", userId, "reviewId:", reviewId);
            res.status(400).send({error: 'userId and reviewId are required'});
            return;
        }

        try {
            const likes = await this.likeService.like({userId: userId, reviewId: reviewId});
            res.status(201).send(likes);
        } catch (error) {
            next(error);
        }
    }
}