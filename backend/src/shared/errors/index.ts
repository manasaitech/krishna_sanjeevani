import { ContentfulStatusCode } from "hono/utils/http-status";

export class AppError extends Error {
  public status: ContentfulStatusCode;
  public errors: any[];

  constructor(message: string, status: ContentfulStatusCode = 500, errors: any[] = []) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors: any[] = []) {
    super(message, 400, errors);
  }
}
