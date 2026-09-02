import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '@shared/errors/AppError.js';
import { searchPlaces } from './placesService.js';

export const placesRouter = Router();

// Validação rigorosa: o usuário nunca controla a query Overpass diretamente,
// só estes campos estruturados, que passam por resolveSegmentTags/buildOverpassQuery.
const searchBodySchema = z.object({
  segment: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  radiusMeters: z.number().int().positive().max(20_000).optional(),
  maxResults: z.number().int().positive().max(100).optional(),
});

placesRouter.post('/search', async (req, res, next) => {
  try {
    const parsed = searchBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.validation('Parâmetros de busca inválidos.', parsed.error.flatten());
    }

    const result = await searchPlaces(parsed.data);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
