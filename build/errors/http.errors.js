"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.ForbiddenError = exports.BadRequestError = exports.InternalServerError = void 0;
class InternalServerError extends Error {
    constructor(message, statusCode = 500, statusMessage = "Internal Server Error") {
        super(message);
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }
}
exports.InternalServerError = InternalServerError;
class BadRequestError extends Error {
    constructor(message, statusCode = 400, statusMessage = "Bad Request") {
        super(message);
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }
}
exports.BadRequestError = BadRequestError;
class ForbiddenError extends Error {
    constructor(message, statusCode = 403, statusMessage = "Forbidden") {
        super(message);
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }
}
exports.ForbiddenError = ForbiddenError;
class UnauthorizedError extends Error {
    constructor(message, statusCode = 401, statusMessage = "Unauthorized") {
        super(message);
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
    }
}
exports.UnauthorizedError = UnauthorizedError;
//# sourceMappingURL=http.errors.js.map