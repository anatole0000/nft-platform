// processors/auction.processor.ts
import { Worker } from 'bullmq';
import connection from '../lib/bullmq-connection';

new Worker(
  'auctionQueue',
  async job => {
    const { nftId } = job.data;
    console.log(`🔨 Closing auction for NFT ${nftId}`);
    // await closeAuction(nftId);
  },
  { connection }
);
