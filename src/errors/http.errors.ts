export class InternalServerError extends Error {
  public message: string;
  public statusCode: number;
  public statusMessage: string;
  constructor(
    message: string,
    statusCode: number = 500,
    statusMessage: string = "Internal Server Error"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

export class BadRequestError extends Error {
  public message: string;
  public statusCode: number;
  public statusMessage: string;
  constructor(
    message: string,
    statusCode: number = 400,
    statusMessage: string = "Bad Request"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

export class ForbiddenError extends Error {
  public message: string;
  public statusCode: number;
  public statusMessage: string;
  constructor(
    message: string,
    statusCode: number = 403,
    statusMessage: string = "Forbidden"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}

export class UnauthorizedError extends Error {
  public message: string;
  public statusCode: number;
  public statusMessage: string;
  constructor(
    message: string,
    statusCode: number = 401,
    statusMessage: string = "Unauthorized"
  ) {
    super(message);
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }
}
