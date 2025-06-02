// queue/auction.queue.ts
import { Queue } from 'bullmq';
import connection from '../lib/bullmq-connection';

export const auctionQueue = new Queue('auctionQueue', {
  connection,
});
