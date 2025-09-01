import { Service } from 'typedi';
import { ReviewService } from './review.service';
import { Review } from './review.model';
import { BaseController } from "../base/base.controller";
import { config } from '../../config/environment';
import { authenticateToken } from "../../middleware/auth.middleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         bookId:
 *           type: string
 *         userId:
 *           type: integer
 *         rating:
 *           type: number
 *         comment:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         likes:
 *           type: integer
 *         user:
 *           $ref: '#/components/schemas/User'
 *         book:
 *           $ref: '#/components/schemas/Book'
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         username:
 *           type: string
 *         email:
 *           type: string
 *     Book:
 *       type: object
 *       properties:
 *         bookId:
 *           type: string
 *         title:
 *           type: string
 *         authors:
 *           type: array
 *           items:
 *             type: string
 *         publishedDate:
 *           type: string
 *           format: date
 *         description:
 *           type: string
 *         pageCount:
 *           type: integer
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *         thumbnail:
 *           type: string
 *         language:
 *           type: string
 *         previewLink:
 *           type: string
 *         rating:
 *           type: number
 *           nullable: true
 *         reviewCount:
 *           type: integer
 *           nullable: true
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
export class ReviewController extends BaseController<Review> {
    protected entityConfig = config.entityValues.review;

    constructor(
        protected reviewService: ReviewService
    ) {
        super(reviewService);

        this.getRouter().put('/:id', authenticateToken, this.update.bind(this));
        this.getRouter().post('/', authenticateToken, this.create.bind(this));
        this.getRouter().delete('/:id', authenticateToken, this.delete.bind(this));
        this.getRouter().get('/', this.getByBookId.bind(this));
    }

    /**
     * @swagger
     * /books/{bookId}/reviews:
     *   get:
     *     tags:
     *       - Reviews
     *     summary: Get all reviews for a book
     *     parameters:
     *       - in: path
     *         name: bookId
     *         schema:
     *           type: string
     *         required: true
     *         description: Book ID
     *     responses:
     *       200:
     *         description: Reviews retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Review'
     *       404:
     *         description: No reviews found for this book
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
    async getByBookId(req: any, res: any, next: any): Promise<void> {
        try {
            const bookId = req.params.bookId;
            const reviews = await this.reviewService.getByBookId(bookId);
            if (!reviews || reviews.length === 0) {
                res.status(404).json({ status: 'error', message: 'No reviews found for this book', data: null });
                return;
            }
            res.status(200).json(reviews);
        } catch (error: any) {
            next(error);
        }
    }

    /**
     * @swagger
     * /books/{bookId}/reviews:
     *   post:
     *     tags:
     *       - Reviews
     *     summary: Create a review for a book
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: bookId
     *         schema:
     *           type: string
     *         required: true
     *         description: Book ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - rating
     *               - comment
     *             properties:
     *               rating:
     *                 type: number
     *               comment:
     *                 type: string
     *     responses:
     *       201:
     *         description: Review created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Review'
     *       400:
     *         description: Invalid request body
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       409:
     *         description: Review already exists for this book and user
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

    /**
     * @swagger
     * /books/{bookId}/reviews/{id}:
     *   put:
     *     tags:
     *       - Reviews
     *     summary: Update a review
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
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: Review ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               rating:
     *                 type: number
     *               comment:
     *                 type: string
     *     responses:
     *       200:
     *         description: Review updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Review'
     *       400:
     *         description: Invalid request body
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       403:
     *         description: Forbidden - not review owner
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       404:
     *         description: Review not found
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
    async update(req: any, res: any, next: any): Promise<void> {
        const userId = req.user?.id;
        const ownerId = req.body.userId;
        if (userId !== ownerId) {
            return res.status(403).json({ status: 'error', message: 'You are not allowed to update this review.', data: null });
        }
        return super.update(req, res, next);
    }

    /**
     * @swagger
     * /books/{bookId}/reviews/{id}:
     *   delete:
     *     tags:
     *       - Reviews
     *     summary: Delete a review
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
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: Review ID
     *     responses:
     *       200:
     *         description: Review deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                 message:
     *                   type: string
     *       404:
     *         description: Review not found
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
    async delete(req: any, res: any, next: any): Promise<void> {
        return super.delete(req, res, next);
    }
}