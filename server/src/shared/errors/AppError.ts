export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'EXTERNAL_API_ERROR'
  | 'LLM_ERROR'
  | 'LLM_INVALID_RESPONSE'
  | 'RATE_LIMITED'
  | 'CONFLICT'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly httpStatus: number;
  readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, httpStatus = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }

  static validation(message: string, details?: unknown) {
    return new AppError('VALIDATION_ERROR', message, 400, details);
  }

  static notFound(message: string) {
    return new AppError('NOT_FOUND', message, 404);
  }

  static externalApi(message: string, details?: unknown) {
    return new AppError('EXTERNAL_API_ERROR', message, 502, details);
  }

  static llm(message: string, details?: unknown) {
    return new AppError('LLM_ERROR', message, 502, details);
  }

  static llmInvalidResponse(message: string, details?: unknown) {
    return new AppError('LLM_INVALID_RESPONSE', message, 502, details);
  }
}
