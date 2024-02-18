import { Config, StackContext } from "sst/constructs";

export function SecretsStack({ stack }: StackContext) {
  const secrets = Config.Secret.create(
    //
    stack,
    "DATABASE_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET"
  );
  return secrets;
}