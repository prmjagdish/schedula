import { z } from "zod";

export const createPatientSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
});
