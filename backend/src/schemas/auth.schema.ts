// schemas/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  password: z.string().min(6, { message: 'Mật khẩu phải ít nhất 6 ký tự' }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
