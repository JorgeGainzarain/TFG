import {Service} from 'typedi';
import {Like} from "./like.model";
import {BaseController} from "../base/base.controller";
import {config} from '../../config/environment';
import {LikeService} from "./like.service";
import {authenticateToken} from "../../middleware/auth.middleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         reviewId:
 *           type: integer
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           nullable: true
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

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

    /**
     * @swagger
     * /books/{bookId}/reviews/{reviewId}/likes/me:
     *   get:
     *     tags:
     *       - Likes
     *     summary: Check if the authenticated user has liked a review
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: bookId
     *         schema:
     *           type: string
     *         required: true
     *         description: Book ID
     *       - in: path
     *         name: reviewId
     *         schema:
     *           type: string
     *         required: true
     *         description: Review ID
     *     responses:
     *       200:
     *         description: Like status retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 liked:
     *                   type: boolean
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       400:
     *         description: Missing userId or reviewId
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async isLiked(req: any, res: any, next:any): Promise<void> {
        const userId = req.user?.id;
        const reviewId = req.params.reviewId;

        try {
            let like;
            if (!userId || !reviewId) {
                like = false;
            }
            else {
                like = await this.likeService.existsByFields({userId: userId, reviewId: reviewId});
            }
            res.status(200).send({liked: !!like});
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /books/{bookId}/reviews/{reviewId}/likes:
     *   post:
     *     tags:
     *       - Likes
     *     summary: Like or unlike a review (toggle)
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: bookId
     *         schema:
     *           type: string
     *         required: true
     *         description: Book ID
     *       - in: path
     *         name: reviewId
     *         schema:
     *           type: string
     *         required: true
     *         description: Review ID
     *     responses:
     *       201:
     *         description: Review liked or unliked successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 likes:
     *                   type: integer
     *       400:
     *         description: Missing userId or reviewId
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       401:
     *         description: Authentication required
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     */
    async like(req: any, res: any, next: any): Promise<void> {
        const reviewId = req.params.reviewId;
        const userId = req.user?.id;

        if (!userId || !reviewId) {
            res.status(400).send({error: 'userId and reviewId are required'});
            return;
        }

        try {
            const likes = await this.likeService.like({userId: userId, reviewId: reviewId});
            res.status(201).send({likes});
        } catch (error) {
            next(error);
        }
    }
}