import express from 'express';
import { createAuction } from '../controllers/auction.controller';

const router = express.Router();

router.post('/', createAuction);

export default router;
