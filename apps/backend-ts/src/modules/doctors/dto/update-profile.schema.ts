import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  experienceYears: z.number().int().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  consultationHours: z.string().optional(),
  bio: z.string().optional(),
  specializations: z.array(z.string()).optional(),
});