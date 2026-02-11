import { z } from 'zod';

export const SigninDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SigninDto = z.infer<typeof SigninDtoSchema>;
