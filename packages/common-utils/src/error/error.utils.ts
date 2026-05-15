// Error utilities — standard error types across the application

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function createAppError(
  message: string,
  code: string,
  statusCode = 500,
  metadata?: Record<string, unknown>
): AppError {
  return new AppError(message, code, statusCode, metadata);
}

export function createNotFoundError(entity: string, id: string): AppError {
  return new AppError(
    `${entity} not found: ${id}`,
    "NOT_FOUND",
    404,
    { entity, id }
  );
}

export function createValidationError(
  message: string,
  fields?: Record<string, string>
): AppError {
  return new AppError(message, "VALIDATION_ERROR", 400, { fields });
}
