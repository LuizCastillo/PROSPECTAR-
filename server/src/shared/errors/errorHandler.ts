import type { NextFunction, Request, Response } from 'express';
import { AppError } from './AppError.js';

// Middleware final de tratamento de erros. Nunca deve vazar stack trace,
// secrets ou detalhes internos para o cliente em produção.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const log = req.log ?? console;

  if (err instanceof AppError) {
    log.warn?.({ code: err.code, details: err.details }, err.message);
    return res.status(err.httpStatus).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  log.error?.({ err }, 'Unhandled error');
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Erro interno inesperado.',
    },
  });
}
