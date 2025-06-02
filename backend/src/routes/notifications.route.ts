// routes/notifications.ts
import express from 'express';
import { getNotifications } from '../controllers/notifications.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);

export default router;
