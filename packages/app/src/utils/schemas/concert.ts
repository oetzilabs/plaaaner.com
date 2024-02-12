import { z } from "zod";
import { ConcertLocationSchema, EventLocationSchema } from "./shared";

const TicketSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(3).max(50),
  price: z.number({ required_error: "Price is required" }).min(1),
  quantity: z.number({ required_error: "Quantity is required" }).min(1),
});

export const CreateConcertFormSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(3).max(50),
  description: z.string().min(3).optional(),
  day: z.date().optional(),
  duration: z.number().optional(),
  capacity: z.number().optional(),
  location: ConcertLocationSchema,
  tickets: z.array(TicketSchema),
});
