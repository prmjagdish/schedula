import { max } from "rxjs";
import { z } from "zod";

export const CreateSlotSchema = z
  .object({
    date: z.string().datetime(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    maxAppointments: z.number().int().positive(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "Start time must be before end time",
    path: ["startTime"],
  });

export type CreateSlotDto = z.infer<typeof CreateSlotSchema>;
