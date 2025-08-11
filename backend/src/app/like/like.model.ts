import {BaseModel} from "../base/base.model";

export interface Like extends BaseModel {
    userId: number;
    reviewId: number;
}