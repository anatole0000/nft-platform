import { auctionQueue } from '../queue/auction.queue';

export const scheduleAuctionClose = async (nftId: string, closeAt: Date) => {
  const delay = closeAt.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error('Close time must be in the future');
  }

  // Thêm job với tên 'closeAuction', dữ liệu nftId, delay tính bằng ms
  await auctionQueue.add(
    'closeAuction',
    { nftId },
    { delay }
  );
};
