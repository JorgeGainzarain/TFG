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
    this.apiRouter = Router();
    this.apiRouter.use('/reviews', reviewController.getRouter());
    this.apiRouter.use('/auth', userController.getRouter());
    this.apiRouter.use('/health', this.healthCheck.bind(this));
    this.apiRouter.use('/books', bookController.getRouter());
    this.apiRouter.use('/users/:userId/libraries', libraryController.getRouter());
    this.apiRouter.use('/likes', likeController.getRouter());
  }

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
