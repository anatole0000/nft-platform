import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Simulated in-memory refresh token store, bạn nên lưu DB hoặc Redis trong thực tế
const refreshTokensStore = new Map<string, string>(); // key: refreshToken, value: userId

export const registerUser = async (email: string, password: string) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  return user;
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  // Tạo access token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

  // Tạo refresh token (dài hơn, ít expire hơn)
  const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Lưu refresh token vào store (cần lưu DB/Redis ở production)
  refreshTokensStore.set(refreshToken, user.id);

  return { token, refreshToken, user };
};

export const logoutUser = async (refreshToken: string) => {
  // Xóa refresh token khỏi store (hoặc DB/Redis)
  refreshTokensStore.delete(refreshToken);
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken || !refreshTokensStore.has(refreshToken)) {
    throw new Error('Invalid refresh token');
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };

    // Tạo token mới
    const token = jwt.sign({ userId: payload.userId }, JWT_SECRET, { expiresIn: '1d' });

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new Error('User not found');

    return { token, user };
  } catch {
    throw new Error('Invalid refresh token');
  }
};

export const changeUserPassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error('Old password is incorrect');

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword },
  });
};

// Giả sử bạn có một bảng hoặc hệ thống gửi email, ở đây chỉ mô phỏng logic
const resetTokensStore = new Map<string, { userId: string; expires: number }>();

export const sendPasswordResetEmail = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // Không báo lỗi để tránh dò user

  // Tạo token reset random
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 1000 * 60 * 60; // 1 giờ

  resetTokensStore.set(resetToken, { userId: user.id, expires });

  // TODO: Gửi email kèm link reset chứa resetToken
  console.log(`Send email to ${email} with reset token: ${resetToken}`);
};

export const resetUserPassword = async (token: string, newPassword: string) => {
  const resetData = resetTokensStore.get(token);
  if (!resetData) throw new Error('Invalid or expired reset token');

  if (resetData.expires < Date.now()) {
    resetTokensStore.delete(token);
    throw new Error('Reset token expired');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: resetData.userId },
    data: { password: hashedPassword },
  });

  resetTokensStore.delete(token);
};
