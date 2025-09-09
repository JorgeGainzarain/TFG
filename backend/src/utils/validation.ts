import { StatusError } from './status_error';

export function validateRequiredParams<T extends Object>(params: Partial<T>): void {
    const requiredFields = Object.keys(params) as (keyof T)[];
    const missingParams = requiredFields.filter(field => params[field] === undefined || params[field] === null);
    if (missingParams.length > 0) {
        throw new StatusError(400, `Missing required parameter(s): ${missingParams.join(', ')}`);
    }
}

export function validateObject<T extends Object>(obj: Partial<T>, requiredFields: { name: keyof T; type: string }[]): T {
    const invalidFields = requiredFields.filter(field => !(field.name in obj));

    if (invalidFields.length > 0) {
        throw new StatusError(400, `Invalid object. Missing fields: ${invalidFields.map(field => field.name).join(', ')}`);
    }

    const allowedKeys = requiredFields.map(field => field.name);
    const cleanedObj: Partial<T> = {};
    for (const key of allowedKeys) {
        cleanedObj[key] = obj[key];
    }

    validateRequiredParams(cleanedObj);
    return cleanedObj as T;
}

export function validatePartialObject<T extends Object>(obj: Partial<T>, requiredFields: { name: keyof T; type: string }[]): Partial<T> {
    const invalidFields = (Object.keys(obj) as (keyof T)[]).map(key => {
        const field = requiredFields.find(f => f.name === key);
        return !field ? { name: key } : null;
    }).filter(field => field !== null) as { name: keyof T }[];

    if (invalidFields.length  >= requiredFields.length) {
        throw new StatusError(400, `Invalid object. No valid fields`);
    }

    return obj;
}