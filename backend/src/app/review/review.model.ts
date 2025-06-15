import {BaseModel} from "../base/base.model";
import {Book} from "../book/book.model";

export interface Review extends BaseModel {
    id?: number;
    bookId: string;
    book?: Book;
    userId: number;
    rating: number;
    comment: string;
    createdAt?: Date;
    likes: number;
}

