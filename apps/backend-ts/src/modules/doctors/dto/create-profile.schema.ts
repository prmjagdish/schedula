import { z } from 'zod';

export const createProfileSchema = z.object({
  fullName: z.string().min(2),
  experienceYears: z.number().min(0),
  consultationFee: z.number().positive(),
  consultationHours: z.string(),
  bio: z.string().optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
