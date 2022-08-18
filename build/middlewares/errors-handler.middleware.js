"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
function errorHandler(err, req, res, next) {
    var _a;
    if ((_a = err === null || err === void 0 ? void 0 : err.constructor) === null || _a === void 0 ? void 0 : _a.name) {
        var errorType = err.constructor.name;
        console.log(errorType);
        var errorMessage = err.message;
        var path = req.path;
        switch (errorType) {
            case "ForbiddenError":
                res.status(403);
                res.json({
                    status: "error",
                    statusCode: 403,
                    statusMessage: "Forbidden",
                    message: errorMessage,
                    path: path,
                });
                return;
            case "UnauthorizedError":
                res.status(401);
                res.json({
                    status: "error",
                    statusCode: 401,
                    statusMessage: "Unauthorized",
                    message: errorMessage,
                    path: path,
                });
                return;
            case "NotFoundError":
                res.status(400);
                res.json({
                    status: "error",
                    statusCode: 404,
                    statusMessage: "Not found !",
                    message: errorMessage,
                    path: path,
                });
                return;
            case "BadRequestError":
                res.status(400);
                res.json({
                    status: "error",
                    statusCode: 400,
                    statusMessage: "Bad request",
                    message: errorMessage,
                    path: path,
                });
                return;
            case "ValidationError":
                res.status(400);
                res.json({
                    status: "error",
                    statusCode: 400,
                    statusMessage: "Bad request",
                    message: errorMessage,
                    path: path,
                });
                return;
            default:
                res.status(500);
                res.json({
                    status: "error",
                    statusCode: 500,
                    statusMessage: "Internal Server Error",
                    message: errorMessage,
                    path: path,
                });
                return;
        }
    }
    else {
        return next();
    }
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=errors-handler.middleware.js.map