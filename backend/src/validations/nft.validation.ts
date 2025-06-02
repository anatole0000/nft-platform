import { z } from 'zod';

// Validate khi tạo NFT
export const createNFTSchema = z.object({
  name: z.string().min(1, "Name is required"),
  imageUrl: z.string().url("Invalid image URL"),
});

// Validate param id (UUID)
export const nftIdParamSchema = z.object({
  id: z.string().uuid("Invalid NFT id"),
});

export const nftListQuerySchema = z.object({
  ownerId: z.string().uuid().optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});