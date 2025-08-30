import {BaseModel} from "../base/base.model";

export interface Library_Book extends BaseModel{
    id: number;
    libraryId: number;
    bookId: string;
}