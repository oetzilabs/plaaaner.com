import { SSTConfig } from "sst";
import { ApiStack } from "./stacks/ApiStack";
import { StorageStack } from "./stacks/StorageStack";
import { DNSStack } from "./stacks/DNSStack";
import { SolidStartStack } from "./stacks/SolidStartStack";
import { SecretsStack } from "./stacks/SecretsStack";
import { AuthStack } from "./stacks/AuthStack";

export default {
  config(_input) {
    return {
      name: "plaaaner-com",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    app.setDefaultRemovalPolicy("destroy");
    app
      //
      .stack(DNSStack)
      .stack(SecretsStack)
      .stack(StorageStack)
      .stack(AuthStack)
      .stack(ApiStack)
      .stack(SolidStartStack);
  },
} satisfies SSTConfig;
