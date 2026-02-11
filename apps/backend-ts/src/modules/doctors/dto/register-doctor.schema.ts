import { z } from 'zod';

export const registerDoctorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterDoctorInput = z.infer<typeof registerDoctorSchema>;
