import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({ error: error.errors ?? error.message });
  }
};

export const validateParams = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.params);
    next();
  } catch (error: any) {
    res.status(400).json({ error: error.errors ?? error.message });
  }
};

export const validateQuery = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.query);
    next();
  } catch (error: any) {
    res.status(400).json({ error: error.errors ?? error.message });
  }
};