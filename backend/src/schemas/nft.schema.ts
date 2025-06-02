// nft.schema.ts
import { z } from 'zod';

export const nftListQuerySchema = z.object({
  ownerId: z.string().uuid().optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});
