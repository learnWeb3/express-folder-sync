"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBodyParams = exports.requireBodyParams = void 0;
var http_errors_1 = require("../errors/http.errors");
function requireBodyParams(requiredBodyParamsMap) {
    if (requiredBodyParamsMap === void 0) { requiredBodyParamsMap = {}; }
    var errors = [];
    return function (req, res, next) {
        for (var key in requiredBodyParamsMap) {
            if (req.body[key] === undefined || req.body[key] === null) {
                errors.push("body param ".concat(key, " is required"));
            }
        }
        if (errors.length) {
            next(new http_errors_1.BadRequestError(errors.join(", ")));
        }
        else {
            next();
        }
    };
}
exports.requireBodyParams = requireBodyParams;
function validateBodyParams(bodyKeyToValidatorMap) {
    if (bodyKeyToValidatorMap === void 0) { bodyKeyToValidatorMap = {}; }
    var errors = [];
    return function (req, res, next) {
        for (var key in req.body) {
            if (bodyKeyToValidatorMap[key]) {
                var _a = bodyKeyToValidatorMap[key](req.body[key]), paramValidationErrors = _a.errors, isValid = _a.isValid;
                if (!isValid) {
                    errors.push("body param ".concat(key, " is not valid, reasons: ").concat(paramValidationErrors.join(", ")));
                }
            }
            if (errors.length) {
                next(new http_errors_1.BadRequestError(errors.join(", ")));
            }
            else {
                next();
            }
        }
    };
}
exports.validateBodyParams = validateBodyParams;
//# sourceMappingURL=body-params.middlewraes.js.map