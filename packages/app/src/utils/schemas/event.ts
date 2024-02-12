import dayjs from "dayjs";
import { z } from "zod";
import { EventLocationSchema } from "./shared";

const DiscriminatedEventFormSchema = z.discriminatedUnion("time_type", [
  z
    .object({
      time_type: z.literal("range"),
      start_time: z
        .string()
        .or(z.date())
        .transform((v) => dayjs(v).toDate()),
      // check if end_time is after start_time
      end_time: z
        .string()
        .or(z.date())
        .transform((v) => dayjs(v).toDate()),
    })
    .strict(),
  z
    .object({
      time_type: z.literal("full_day"),
      day: z
        .string()
        .or(z.date())
        .transform((v) => dayjs(v).startOf("day").toDate()),
    })
    .strict(),
]);

export const CreateEventFormSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(3).optional(),
  location: EventLocationSchema,
  time: DiscriminatedEventFormSchema.refine((data) => {
    if (data.time_type === "range") {
      return dayjs(data.start_time).isBefore(dayjs(data.end_time));
    }
    return true;
  }),
});
