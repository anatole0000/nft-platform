import express from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { rateLimiterMiddleware } from '../middlewares/rateMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

import {
  logout,
  refreshToken,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', rateLimiterMiddleware, validateBody(loginSchema), login);

router.post('/logout', authMiddleware, logout);
router.post('/refresh', refreshToken);
router.get('/me', authMiddleware, getProfile);
router.post('/change-password', authMiddleware, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
