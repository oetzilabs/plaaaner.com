import { z } from "zod";
import { ConcertLocationSchema } from "./shared";
import type { TicketTypeSelect } from "@/core/drizzle/sql/schema";

const TicketPrice = z.number({ required_error: "Price is required" }).min(0).step(0.01);
const TicketCurrency = z.discriminatedUnion("currency_type", [
  z.object({ currency_type: z.literal("free") }),
  z.object({ currency_type: z.literal("usd") }),
  z.object({ currency_type: z.literal("eur") }),
  z.object({ currency_type: z.literal("chf") }),
  z.object({ currency_type: z.literal("other"), value: z.string({ required_error: "Value is required" }) }),
]);

export const TicketShape = z.union([
  z.literal("default"),
  z.literal("default-1"),
  z.literal("default-2"),
  z.literal("custom"),
]);

export const BaseTicketSchema = z.object({
  name: z.string({ required_error: "Name is required" }).max(50),
  shape: TicketShape,
  price: TicketPrice,
  currency: TicketCurrency,
  quantity: z.number({ required_error: "Quantity is required" }).min(0),
  ticket_type: z.custom<TicketTypeSelect>(),
});

const CapacitySchema = z.discriminatedUnion("capacity_type", [
  z.object({ capacity_type: z.literal("none"), value: z.literal("none") }),
  z.object({ capacity_type: z.literal("custom"), value: z.number({ required_error: "Value is required" }).min(0) }),
  z.object({
    capacity_type: z.literal("recommended"),
    value: z.union([z.literal("50"), z.literal("100"), z.literal("200"), z.literal("300")]),
  }),
]);

const BaseEventSchema = z.object({
  referenced_from: z.string().optional(),
  name: z.string({ required_error: "Name is required" }).min(3).max(50),
  description: z.string().optional().nullable(),
  days: z.array(z.date()).length(2),
  time_slots: z.record(
    z.record(
      z.object({
        start: z.date(),
        end: z.date(),
      })
    )
  ),
  capacity: CapacitySchema,
  location: ConcertLocationSchema,
  tickets: z.array(BaseTicketSchema),
});

export const CreateEventFormSchema = z.discriminatedUnion("event_type", [
  BaseEventSchema.merge(
    z.object({
      event_type: z.literal("event"),
    })
  ),
  BaseEventSchema.merge(
    z.object({
      event_type: z.literal("concert"),
    })
  ),
  BaseEventSchema.merge(
    z.object({
      event_type: z.literal("tournament"),
    })
  ),
  BaseEventSchema.merge(
    z.object({
      event_type: z.literal("custom-event"),
    })
  ),
]);

export const EventType = z.union([
  z.literal("event"),
  z.literal("concert"),
  z.literal("tournament"),
  z.literal("custom-event"),
]);

export const RefinedCreateEventFormSchema = CreateEventFormSchema.refine((data) => {
  if (data.capacity.capacity_type === "none") {
    return true;
  }
  const cp = parseInt(String(data.capacity.value));
  return cp > 0 && data.tickets.length > 0 && data.tickets.reduce((acc, t) => acc + t.quantity, 0) === cp;
});
