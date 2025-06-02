import { Queue, Worker, Job } from 'bullmq';
import connection from '../lib/bullmq-connection';
import prisma from '../prisma/client';
import { sendAuctionWinnerEmail } from '../utils/mailer';

const auctionQueueName = 'auctionQueue';
const auctionQueue = new Queue(auctionQueueName, { connection });

const auctionWorker = new Worker(
  auctionQueueName,
  async (job: Job) => {
    const { nftId } = job.data;

    console.log('🔧 Closing auction for NFT:', nftId);

    // 1. Lấy thông tin phiên đấu giá và các bid liên quan
    const auction = await prisma.auction.findUnique({
      where: { nftId },
      include: {
        bids: true,
        nft: true,
      },
    });

    if (!auction || !auction.active) {
      console.log('⚠️ Auction not found or already closed.');
      return;
    }

    // 2. Đóng phiên đấu giá
    await prisma.auction.update({
      where: { id: auction.id },
      data: {
        active: false,
        endTime: new Date(),
      },
    });

    // 3. Tìm người bid cao nhất
    if (!auction.bids || auction.bids.length === 0) {
      console.log('⛔ No bids were placed.');
      return;
    }

    const highestBid = auction.bids.reduce((max, bid) =>
      bid.amount > max.amount ? bid : max
    );

    // 4. Chuyển quyền sở hữu NFT cho người thắng
    await prisma.nFT.update({
      where: { id: auction.nftId },
      data: { ownerId: highestBid.userId },
    });

    // 5. Log hoặc gửi thông báo
    console.log(`✅ NFT "${auction.nft.name}" transferred to user ${highestBid.userId}`);
    console.log(`📢 Notify user ${highestBid.userId} about winning the auction`);

    // TODO: Gửi email thực hoặc thông báo push
    
    // 5. Tạo notification cho người thắng
    await prisma.notification.create({
      data: {
        userId: highestBid.userId,
        title: 'Bạn đã thắng phiên đấu giá!',
        message: `Bạn trở thành chủ sở hữu mới của NFT "${auction.nft.name}" với giá ${highestBid.amount} ETH.`,
      },
    });

    // 6. Ghi lịch sử chuyển nhượng
    await prisma.transferHistory.create({
      data: {
        nftId: auction.nftId,
        fromUserId: auction.ownerId,
        toUserId: highestBid.userId,
        amount: highestBid.amount,
      },
    });

    // 7. Gửi email thông báo người thắng
    const winner = await prisma.user.findUnique({ where: { id: highestBid.userId } });

    if (winner?.email) {
    await sendAuctionWinnerEmail(winner.email, auction.nft.name, highestBid.amount);
  }

  },
  { connection }
);

auctionWorker.on('completed', (job: Job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

auctionWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});

export { auctionQueue };
