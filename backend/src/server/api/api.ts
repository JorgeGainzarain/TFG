import { Router } from 'express';
import { Service } from 'typedi';
import {ReviewController} from "../../app/review/review.controller";
import {UserController} from "../../app/user/user.controller";

@Service()
export class Api {
  private readonly apiRouter: Router;

  constructor(
      protected reviewController: ReviewController,
      protected userController: UserController
  ) {
    this.apiRouter = Router();
    this.apiRouter.use('/review', reviewController.getRouter());
    this.apiRouter.use('/', userController.getRouter());
  }

  getApiRouter(): Router {
    return this.apiRouter;
  }

}
