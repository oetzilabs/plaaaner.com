import { AnySchema, BaseIssue, BaseSchema, safeParse } from "valibot";

export function createValidatedFunction<I, O, IS, BI extends BaseIssue<IS>>(
  inputSchema: BaseSchema<I, O, BI>,
  implementation: (input: I) => Promise<O>,
) {
  return async (input: I): Promise<O> => {
    const isSafe = safeParse(inputSchema, input);
    if (isSafe.success) {
      return implementation(input);
    } else {
      throw isSafe.issues;
    }
  };
}
