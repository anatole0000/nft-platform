import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.route';
import nftRoutes from './routes/nft.route';
import auctionRoutes from './routes/auction.route';
import transferRoutes from './routes/transfer.route';
import notificationsRoutes from './routes/notifications.route';
import './processors/auction.processor';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/nfts', nftRoutes);
app.use('/auction', auctionRoutes);
app.use('/transfers', transferRoutes);
app.use('/notifications', notificationsRoutes);


app.get('/', (req, res) => {
  res.send('NFT Auction Backend is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
