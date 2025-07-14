import {BaseModel} from "../base/base.model";
import {Book} from "../book/book.model";
import {User} from "../user/user.model";

export interface Review extends BaseModel {
    id?: number;
    bookId: string;
    book?: Book;
    user?: User;
    userId: number;
    rating: number;
    comment: string;
    createdAt?: Date;
    likes: number;
}

