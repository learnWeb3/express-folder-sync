export declare class InternalServerError extends Error {
    message: string;
    statusCode: number;
    statusMessage: string;
    constructor(message: string, statusCode?: number, statusMessage?: string);
}
export declare class BadRequestError extends Error {
    message: string;
    statusCode: number;
    statusMessage: string;
    constructor(message: string, statusCode?: number, statusMessage?: string);
}
export declare class ForbiddenError extends Error {
    message: string;
    statusCode: number;
    statusMessage: string;
    constructor(message: string, statusCode?: number, statusMessage?: string);
}
export declare class UnauthorizedError extends Error {
    message: string;
    statusCode: number;
    statusMessage: string;
    constructor(message: string, statusCode?: number, statusMessage?: string);
}
