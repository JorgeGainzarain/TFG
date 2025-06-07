import { BaseModel } from "../base/base.model";

export interface User extends BaseModel {
    id?: number;
    username: string;
    email: string;
    password: string;
    createdAt?: Date;
}