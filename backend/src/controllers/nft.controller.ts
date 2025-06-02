import { Request, Response } from 'express';
import { createNFT, getNFTList, getNFTById } from '../services/nft.service';
import { AuthRequest } from '../middlewares/authMiddleware';
import logger from '../utils/logger';

/**
 * Controller to create a new NFT.
 * Requires authenticated user (userId available from auth middleware).
 * Validates input fields: `name` and `imageUrl`.
 * 
 * @param req - Express request, expects body with { name: string, imageUrl: string }
 * @param res - Express response, returns the created NFT or an error
 */
export const createNFTController = async (
  req: Request,
  res: Response
): Promise<void> => {
  logger.info('POST /nfts - createNFTController called');
  try {
    const { name, imageUrl } = req.body;
    const authReq = req as AuthRequest; // Cast to get userId from auth middleware
    const ownerId = authReq.user?.id;
    if (!name || !imageUrl) {
      logger.warn('createNFTController: missing required fields name or imageUrl');
      res.status(400).json({ error: 'Name and imageUrl are required' });
      return;
    }
    if (!ownerId) {
      logger.warn('createNFTController: missing ownerId from authenticated user');
      res.status(401).json({ error: 'Unauthorized: OwnerId is required' });
      return;
    }


    const nft = await createNFT(name, imageUrl, ownerId);
    logger.info(`NFT created with id=${nft.id}`);
    res.status(201).json(nft);
  } catch (error: any) {
    logger.error('createNFTController error: %o', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Controller to get a list of all NFTs.
 * Uses Redis cache to improve performance.
 * 
 * @param req - Express request
 * @param res - Express response, returns an array of NFTs or an error
 */
export const listNFTsController = async (req: Request, res: Response) => {
  try {
    const { ownerId, limit = 10, sort = 'asc' } = req.query as {
      ownerId?: string;
      limit?: number;
      sort?: 'asc' | 'desc';
    };

    const nfts = await getNFTList({ ownerId, limit, sort });

    res.json(nfts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * Controller to get details of a specific NFT by its `id` from route params.
 * Returns 404 if the NFT is not found.
 * Uses Redis cache to optimize query performance.
 * 
 * @param req - Express request, expects params with NFT id
 * @param res - Express response, returns NFT details or an error
 */
export const getNFTController = async (req: Request, res: Response) => {
  logger.info(`GET /nfts/${req.params.id} - getNFTController called`);
  try {
    const { id } = req.params;
    const nft = await getNFTById(id);
    if (!nft) {
      logger.warn(`NFT with id=${id} not found`);
      res.status(404).json({ error: 'NFT not found' });
      return;
    }
    res.json(nft);
  } catch (error: any) {
    logger.error('getNFTController error: %o', error);
    res.status(500).json({ error: error.message });
  }
};
