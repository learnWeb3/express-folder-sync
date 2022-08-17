const { BadRequestError } = require("../errors");

function requireBodyParams(requiredBodyParamsMap = {}) {
  const errors = [];
  return function (req, res, next) {
    for (const key in requiredBodyParamsMap) {
      if (
        req.body[key] === undefined ||
        req.body[key] === null
      ) {
        errors.push(`body param ${key} is required`);
      }
    }
    if (errors.length) {
      next(new BadRequestError(errors.join(", ")));
    } else {
      next();
    }
  };
}

function validateBodyParams(bodyKeyToValidatorMap = {}) {
  const errors = [];
  return function (req, res, next) {
    for (const key in req.body) {
      if (bodyKeyToValidatorMap[key]) {
        const { errors: paramValidationErrors, isValid } =
          bodyKeyToValidatorMap[key](req.body[key]);
        if (!isValid) {
          errors.push(
            `body param ${key} is not valid, reasons: ${paramValidationErrors.join(
              ", "
            )}`
          );
        }
      }
      if (errors.length) {
        next(new BadRequestError(errors.join(", ")));
      } else {
        next();
      }
    }
  };
}

module.exports = { requireBodyParams, validateBodyParams };
