import {BaseModel} from "../base/base.model";

export interface Library extends BaseModel {
    userId: string;
    title: string;
    bookIds: string[] | string;
}

