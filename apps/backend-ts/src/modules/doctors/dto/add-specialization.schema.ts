import { z } from 'zod';

export const addSpecializationSchema = z.object({
  name: z.string().min(2),
});

export type AddSpecializationInput = z.infer<typeof addSpecializationSchema>;
