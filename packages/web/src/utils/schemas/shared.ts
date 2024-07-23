import { z } from "zod";

export const EventLocationSchema = z.discriminatedUnion("location_type", [
  z.object({
    location_type: z.literal("online"),
    url: z.string().url(),
  }),
  z.object({
    location_type: z.literal("in_person"),
    address: z.string(),
  }),
]);

export const ConcertLocationSchema = z.discriminatedUnion("location_type", [
  z.object({
    location_type: z.literal("online"),
    url: z.string().url(),
  }),
  z.object({
    location_type: z.literal("venue"),
    address: z.string(),
  }),
  z.object({
    location_type: z.literal("festival"),
    address: z.string(),
  }),
  z.object({
    location_type: z.literal("other"),
    details: z.string(),
  }),
]);
