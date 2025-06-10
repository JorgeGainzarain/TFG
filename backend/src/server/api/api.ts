import {NextFunction, Request, Response, Router} from 'express';
import { Service } from 'typedi';
import {ReviewController} from "../../app/review/review.controller";
import {UserController} from "../../app/user/user.controller";
import {BookController} from "../../app/book/book.controller";
import {LibraryController} from "../../app/library/library.controller";

@Service()
export class Api {
  private readonly apiRouter: Router;

  constructor(
      protected reviewController: ReviewController,
      protected userController: UserController,
      protected bookController: BookController,
      protected libraryController: LibraryController
  ) {
    this.apiRouter = Router();
    this.apiRouter.use('/review', reviewController.getRouter());
    this.apiRouter.use('/auth', userController.getRouter());
    this.apiRouter.use('/health', this.healthCheck.bind(this));
    this.apiRouter.use('/book', bookController.getRouter());
    this.apiRouter.use('/library', libraryController.getRouter());
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
