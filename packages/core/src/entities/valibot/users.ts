import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-valibot";
import { cuid2, email, InferInput, parser, pipe, safeParse, string, transform } from "valibot";
import { db } from "../../drizzle/sql";
import { users } from "../../drizzle/sql/schema";

export * as Validbot_Users from "./users";

const cs = pipe(string(), cuid2());

const Cuid2Schema = pipe(
  string(),
  transform((input: string) => {
    const s = input.split("_");
    const parsed = safeParse(cs, s[s.length - 1]);
    if (parsed.success) {
      return input;
    } else {
      throw parsed.issues;
    }
  }),
);

const EmailSchema = pipe(string(), email());

export const findById = async (input: string) => {
  const parsed = safeParse(Cuid2Schema, input);
  if (parsed.success) {
    return db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.id, parsed.output),
      with: {},
    });
  } else {
    throw parsed.issues;
  }
};

export const findByEmail = async (input: string) => {
  const parsed = safeParse(EmailSchema, input);
  if (parsed.success) {
    return db.query.users.findFirst({
      where: (users, operations) => operations.eq(users.email, parsed.output),
      with: {},
    });
  } else {
    throw parsed.issues;
  }
};

const InputSchema = createInsertSchema(users);

const UpdateSchema = createInsertSchema(users, {
  id: Cuid2Schema,
});

export const create = async (input: InferInput<typeof InputSchema>) => {
  const parsed = safeParse(InputSchema, input);
  if (parsed.success) {
    const [x] = await db.insert(users).values(parsed.output).returning();
    return x;
  } else {
    throw parsed.issues;
  }
};

export const update = async (input: InferInput<typeof UpdateSchema>) => {
  const parsed = safeParse(UpdateSchema, input);
  if (parsed.success) {
    console.log(`Updating user ${parsed.output.id}`);
    const [x] = await db.update(users).set(parsed.output).where(eq(users.id, parsed.output.id)).returning();
    return x;
  } else {
    throw parsed.issues;
  }
};
