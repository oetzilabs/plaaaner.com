import { Config, StackContext } from "sst/constructs";

export function Secrets({ stack }: StackContext) {
  const secrets = Config.Secret.create(
    //
    stack,
    "DATABASE_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "WITH_EMAIL",
    "EMAIL_FROM",
    "LOGIN_ENABLED",
  );
  return secrets;
}
