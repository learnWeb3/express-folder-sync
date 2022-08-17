class InternalServerError extends Error {
  constructor(
    message,
    statusCode = 500,
    statusMessage = "Internal Server Error"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

class BadRequestError extends Error {
  constructor(message, statusCode = 400, statusMessage = "Bad Request") {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

class ForbiddenError extends Error {
  constructor(message, statusCode = 403, statusMessage = "Forbidden") {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

class UnauthorizedError extends Error {
  constructor(message, statusCode = 401, statusMessage = "Unauthorized") {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
  }
}

module.exports = {
  InternalServerError,
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,

};
