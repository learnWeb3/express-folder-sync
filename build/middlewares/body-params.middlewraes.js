"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBodyParams = exports.requireBodyParams = void 0;
const http_errors_1 = require("../errors/http.errors");
const errors_helper_1 = require("../helpers/errors.helper");
function requireBodyParams(requiredBodyParamsMap = {}) {
    const errors = [];
    return function (req, res, next) {
        for (const key in requiredBodyParamsMap) {
            if (req.body[key] === undefined || req.body[key] === null) {
                errors.push(`body param ${key} is required`);
            }
        }
        if (errors.length) {
            (0, errors_helper_1.handleError)(new http_errors_1.BadRequestError(errors.join(", ")), req, res);
        }
        else {
            next();
        }
    };
}
exports.requireBodyParams = requireBodyParams;
function validateBodyParams(bodyKeyToValidatorMap = {}) {
    const errors = [];
    return function (req, res, next) {
        for (const key in req.body) {
            if (bodyKeyToValidatorMap[key]) {
                const { errors: paramValidationErrors, isValid } = bodyKeyToValidatorMap[key](req.body[key]);
                if (!isValid) {
                    errors.push(`body param ${key} is not valid, reasons: ${paramValidationErrors.join(", ")}`);
                }
            }
            if (errors.length) {
                (0, errors_helper_1.handleError)(new http_errors_1.BadRequestError(errors.join(", ")), req, res);
            }
            else {
                next();
            }
        }
    };
}
exports.validateBodyParams = validateBodyParams;
//# sourceMappingURL=body-params.middlewraes.js.map