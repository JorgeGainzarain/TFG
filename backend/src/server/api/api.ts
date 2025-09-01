import {NextFunction, Request, Response, Router} from 'express';
import { Service } from 'typedi';
import {ReviewController} from "../../app/reviews/review.controller";
import {UserController} from "../../app/auth/user.controller";
import {BookController} from "../../app/books/book.controller";
import {LibraryController} from "../../app/libraries/library.controller";
import {LikeController} from "../../app/likes/like.controller";

@Service()
export class Api {
  private readonly apiRouter: Router;

  constructor(
      protected reviewController: ReviewController,
      protected userController: UserController,
      protected bookController: BookController,
      protected libraryController: LibraryController,
      protected likeController: LikeController
  ) {
    this.apiRouter = Router({ mergeParams: true });
    this.apiRouter.use('/books/:bookId/reviews', reviewController.getRouter());
    this.apiRouter.use('/auth', userController.getRouter());
    this.apiRouter.use('/health', this.healthCheck.bind(this));
    this.apiRouter.use('/books', bookController.getRouter());
    this.apiRouter.use('/users/:userId/libraries', libraryController.getRouter());
    this.apiRouter.use('/books/:bookId/reviews/:reviewId/likes', likeController.getRouter());
  }


  /**
   * @swagger
   * /health:
   *   get:
   *     tags:
   *       - Health
   *     summary: Health check for BookHub API
   *     description: Returns API status, timestamp, and authentication status.
   *     responses:
   *       200:
   *         description: API is running
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: OK
   *                 message:
   *                   type: string
   *                   example: BookHub API is running!
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 auth:
   *                   type: string
   *                   example: enabled
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                 message:
   *                   type: string
   */
  async healthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        status: "OK",
        message: "BookHub API is running!",
        timestamp: new Date().toISOString(),
        auth: "enabled"
      });
    } catch (error: any) {
      next(error);
    }
  }

  getApiRouter(): Router {
    return this.apiRouter;
  }



}
