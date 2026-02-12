import { z } from "zod";

export const updatePatientSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
});
