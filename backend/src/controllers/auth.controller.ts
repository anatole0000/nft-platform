import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { refreshAccessToken } from '../services/auth.service';
import prisma from '../prisma/client';
import { changeUserPassword } from '../services/auth.service';
import { sendPasswordResetEmail } from '../services/auth.service';
import { resetUserPassword } from '../services/auth.service';

// Define AuthRequest interface to extend Express Request with userId
interface AuthRequest extends Request {
  userId?: string;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await registerUser(email, password);
    res.status(201).json({ message: 'User created', user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const { token, user } = await refreshAccessToken(refreshToken);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest; // interface có userId
    const user = await prisma.user.findUnique({
      where: { id: authReq.userId },
      select: { id: true, email: true }, // chọn thông tin cần trả về
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.userId!;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Old password and new password required' });
      return;
    }

    await changeUserPassword(userId, oldPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    await sendPasswordResetEmail(email);
    res.json({ message: 'Password reset email sent if user exists' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    await resetUserPassword(token, newPassword);
    res.json({ message: 'Password has been reset successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};