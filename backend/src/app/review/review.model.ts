import {BaseModel} from "../base/base.model";

export interface Review extends BaseModel {
    id?: number;
    bookId: number;
    userId: number;
    rating: number;
    comment: string;
    createdAt?: Date;
    likes: number;
}

