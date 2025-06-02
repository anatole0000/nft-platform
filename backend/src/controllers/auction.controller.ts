import { Request, Response } from 'express';
import { scheduleAuctionClose } from '../services/auction.service';

export const createAuction = async (req: Request, res: Response) => {
  try {
    const { nftId, closeAt } = req.body;

    if (!nftId || !closeAt) {
      res.status(400).json({ error: 'nftId and closeAt are required' });
      return;
    }

    const closeDate = new Date(closeAt);

    await scheduleAuctionClose(nftId, closeDate);

    res.status(201).json({ message: 'Auction scheduled successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
