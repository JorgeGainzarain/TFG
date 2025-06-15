import {BaseModel} from "../base/base.model";

export interface Review extends BaseModel {
    id?: number;
    bookId: string;
    userId: number;
    rating: number;
    comment: string;
    createdAt?: Date;
    likes: number;
}

