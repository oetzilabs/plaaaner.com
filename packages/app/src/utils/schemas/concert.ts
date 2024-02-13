import { z } from "zod";
import { ConcertLocationSchema } from "./shared";

const TicketPrice = z.number({ required_error: "Price is required" }).min(0).step(0.01);
const TicketCurrency = z.discriminatedUnion("currency_type", [
  z.object({ currency_type: z.literal("free") }),
  z.object({ currency_type: z.literal("usd") }),
  z.object({ currency_type: z.literal("eur") }),
  z.object({ currency_type: z.literal("chf") }),
  z.object({ currency_type: z.literal("other"), value: z.string({ required_error: "Value is required" }) }),
]);

const BaseTicketSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(3).max(50),
  price: TicketPrice,
  currency: TicketCurrency,
  quantity: z.number({ required_error: "Quantity is required" }).min(0),
});

export const TicketSchema = z.discriminatedUnion("ticket_type", [
  BaseTicketSchema.merge(
    z.object({
      ticket_type: z.literal("free"),
    })
  ),
  BaseTicketSchema.merge(
    z.object({
      ticket_type: z.literal("free:vip"),
    })
  ),
  BaseTicketSchema.merge(
    z.object({
      ticket_type: z.literal("paid:vip"),
    })
  ),
  BaseTicketSchema.merge(
    z.object({
      ticket_type: z.literal("paid:regular"),
    })
  ),
  BaseTicketSchema.merge(
    z.object({
      ticket_type: z.literal("paid:student"),
    })
  ),
]);

const CapacitySchema = z.discriminatedUnion("capacity_type", [
  z.object({ capacity_type: z.literal("none"), value: z.literal("none") }),
  z.object({ capacity_type: z.literal("custom"), value: z.number({ required_error: "Value is required" }).min(0) }),
  z.object({
    capacity_type: z.literal("recommended"),
    value: z.union([z.literal("50"), z.literal("100"), z.literal("200"), z.literal("300")]),
  }),
]);

export const CreateConcertFormSchema = z
  .object({
    name: z.string({ required_error: "Name is required" }).min(3).max(50),
    description: z.string().min(3).optional(),
    day: z.date().optional(),
    duration: z.number().optional(),
    capacity: CapacitySchema,
    location: ConcertLocationSchema,
    tickets: z.array(TicketSchema),
  })
  .refine((data) => {
    if (data.capacity.capacity_type === "none") {
      return true;
    }
    const cp = parseInt(String(data.capacity.value));
    return cp > 0 && data.tickets.length > 0 && data.tickets.reduce((acc, t) => acc + t.quantity, 0) === cp;
  });
