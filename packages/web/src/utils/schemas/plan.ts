import { prefixed_cuid2 } from "@oetzilabs-plaaaner-com/core/src/custom_cuid2";
import { z } from "zod";
import { ConcertLocationSchema } from "./shared";

const TicketPrice = z.number({ required_error: "Price is required" }).min(0).step(0.01);
const TicketCurrency = z.discriminatedUnion("currency_type", [
  z.object({ currency_type: z.literal("FREE") }),
  z.object({ currency_type: z.literal("USD") }),
  z.object({ currency_type: z.literal("EUR") }),
  z.object({ currency_type: z.literal("CHF") }),
  z.object({ currency_type: z.literal("OTHER"), value: z.string({ required_error: "Value is required" }) }),
]);

export const TicketShape = z.union([
  z.literal("default"),
  z.literal("default-1"),
  z.literal("default-2"),
  z.literal("custom"),
]);

export const TicketType = z.object({
  id: prefixed_cuid2,
  name: z.string().min(1),
  description: z.string().min(1),
  owner_id: prefixed_cuid2,
  payment_type: z.enum(["FREE", "PAID"]),
});

export const BaseTicketSchema = z.object({
  name: z.string({ required_error: "Name is required" }).max(50),
  shape: TicketShape,
  price: TicketPrice,
  currency: TicketCurrency,
  quantity: z.number({ required_error: "Quantity is required" }).min(0),
  ticket_type: TicketType,
});

const CapacitySchema = z.discriminatedUnion("capacity_type", [
  z.object({ capacity_type: z.literal("none"), value: z.literal("none") }),
  z.object({ capacity_type: z.literal("custom"), value: z.number({ required_error: "Value is required" }).min(0) }),
  z.object({
    capacity_type: z.literal("recommended"),
    value: z.union([z.literal("50"), z.literal("100"), z.literal("200"), z.literal("300")]),
  }),
]);

const BasePlanSchema = z.object({
  plan_type_id: prefixed_cuid2.nullable(),
  referenced_from: z.string().optional(),
  name: z.string({ required_error: "Name is required" }).min(3).max(50),
  description: z.string().optional().nullable(),
  days: z.array(z.date()).length(2),
  time_slots: z.record(
    z.record(
      z.object({
        start: z.date(),
        end: z.date(),
      }),
    ),
  ),
  capacity: CapacitySchema,
  location: ConcertLocationSchema,
  tickets: z.array(BaseTicketSchema),
});

export const CreatePlanFormSchema = BasePlanSchema;

export const PlanType = z.union([
  z.literal("event"),
  z.literal("concert"),
  z.literal("tournament"),
  z.literal("custom-event"),
]);

export const RefinedCreatePlanFormSchema = CreatePlanFormSchema.refine((data) => {
  if (data.capacity.capacity_type === "none") {
    return true;
  }
  const cp = parseInt(String(data.capacity.value));
  return cp > 0 && data.tickets.length > 0 && data.tickets.reduce((acc, t) => acc + t.quantity, 0) === cp;
});
