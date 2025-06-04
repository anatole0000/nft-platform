import { Request, Response } from 'express';
import { getTransferHistory } from '../services/transfer.service';
import prisma from '../prisma/client';
import logger from '../utils/logger';
import { redisCache } from '../cache/redis.cache';

export const getTransfers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string | undefined;

    logger.info('🔍 Get transfer history%s', userId ? ` for user ${userId}` : '');

    const transfers = await getTransferHistory(userId);

    res.status(200).json({ transfers });
  } catch (error: any) {
    logger.error('❌ Error in getTransfers: %o', error);
    res.status(500).json({ error: error.message });
  }
};

export const createTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nftId, fromUserId, toUserId, amount } = req.body;
    if (!nftId || !fromUserId || !toUserId || !amount) {
      logger.warn('⚠️ Missing fields in createTransfer');
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const transfer = await prisma.transferHistory.create({
      data: { nftId, fromUserId, toUserId, amount },
    });

    logger.info('✅ Transfer created: NFT %s from %s to %s', nftId, fromUserId, toUserId);

    // Invalidate cache liên quan
    try {
      await redisCache.del('transferHistory:all');
      await redisCache.del(`transferHistory:${fromUserId}`);
      await redisCache.del(`transferHistory:${toUserId}`);
    } catch (err) {
      logger.warn('⚠️ Redis cache delete failed: %o', err);
    }

    res.status(201).json({ transfer });
  } catch (error: any) {
    logger.error('❌ Error in createTransfer: %o', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTransferById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    const transfer = await prisma.transferHistory.findUnique({
      where: { id },
      include: {
        nft: true,
        fromUser: { select: { id: true, email: true } },
        toUser: { select: { id: true, email: true } },
      },
    });

    if (!transfer) {
      res.status(404).json({ error: 'Transfer not found' });
      return;
    }

    res.status(200).json({ transfer });
  } catch (error: any) {
    logger.error('❌ Error in getTransferById: %o', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    const deleted = await prisma.transferHistory.delete({
      where: { id },
    });

    logger.info('🗑️ Transfer deleted with id %s', id);

    // Invalidate all caches vì xóa rồi
    try {
      await redisCache.del('transferHistory:all');
      // Nếu bạn muốn, có thể xóa cache user liên quan nhưng cần lấy fromUserId, toUserId trước khi xóa
    } catch (err) {
      logger.warn('⚠️ Redis cache delete failed: %o', err);
    }

    res.status(200).json({ deleted });
  } catch (error: any) {
    logger.error('❌ Error in deleteTransfer: %o', error);
    res.status(500).json({ error: error.message });
  }
};
