import { z } from 'zod';

export const SignupDtoSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['DOCTOR', 'PATIENT']).optional(),
});

export type SignupDto = z.infer<typeof SignupDtoSchema>;
