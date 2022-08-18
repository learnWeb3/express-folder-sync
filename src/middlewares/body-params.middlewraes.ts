import { BadRequestError } from "../errors/http.errors";

interface RequiredBodyParamsMap {
  [key: string]: boolean;
}

interface ValidationMap {
  [key: string]: Function;
}

export function requireBodyParams(
  requiredBodyParamsMap: RequiredBodyParamsMap = {}
) {
  const errors = [];
  return function (req, res, next) {
    for (const key in requiredBodyParamsMap) {
      if (req.body[key] === undefined || req.body[key] === null) {
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

export function validateBodyParams(bodyKeyToValidatorMap: ValidationMap = {}) {
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
