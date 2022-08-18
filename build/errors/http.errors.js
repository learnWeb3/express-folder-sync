"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.ForbiddenError = exports.BadRequestError = exports.InternalServerError = void 0;
var InternalServerError = (function (_super) {
    __extends(InternalServerError, _super);
    function InternalServerError(message, statusCode, statusMessage) {
        if (statusCode === void 0) { statusCode = 500; }
        if (statusMessage === void 0) { statusMessage = "Internal Server Error"; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.statusMessage = statusMessage;
        return _this;
    }
    return InternalServerError;
}(Error));
exports.InternalServerError = InternalServerError;
var BadRequestError = (function (_super) {
    __extends(BadRequestError, _super);
    function BadRequestError(message, statusCode, statusMessage) {
        if (statusCode === void 0) { statusCode = 400; }
        if (statusMessage === void 0) { statusMessage = "Bad Request"; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.statusMessage = statusMessage;
        return _this;
    }
    return BadRequestError;
}(Error));
exports.BadRequestError = BadRequestError;
var ForbiddenError = (function (_super) {
    __extends(ForbiddenError, _super);
    function ForbiddenError(message, statusCode, statusMessage) {
        if (statusCode === void 0) { statusCode = 403; }
        if (statusMessage === void 0) { statusMessage = "Forbidden"; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.statusMessage = statusMessage;
        return _this;
    }
    return ForbiddenError;
}(Error));
exports.ForbiddenError = ForbiddenError;
var UnauthorizedError = (function (_super) {
    __extends(UnauthorizedError, _super);
    function UnauthorizedError(message, statusCode, statusMessage) {
        if (statusCode === void 0) { statusCode = 401; }
        if (statusMessage === void 0) { statusMessage = "Unauthorized"; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.statusMessage = statusMessage;
        return _this;
    }
    return UnauthorizedError;
}(Error));
exports.UnauthorizedError = UnauthorizedError;
//# sourceMappingURL=http.errors.js.map