import { Request, Response } from 'express';
import { getTransferHistory } from '../services/transfer.service';
import prisma from '../prisma/client';

export const getTransfers = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;

    const transfers = await getTransferHistory(userId);

    res.status(200).json({ transfers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransfer = async (req: Request, res: Response) => {
  try {
    const { nftId, fromUserId, toUserId, amount } = req.body;
    if (!nftId || !fromUserId || !toUserId || !amount) {
      res.status(400).json({ error: 'Missing fields' });
      return;
    }

    const transfer = await prisma.transferHistory.create({
      data: { nftId, fromUserId, toUserId, amount },
    });

    res.status(201).json({ transfer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};