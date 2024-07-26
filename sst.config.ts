import { SSTConfig } from "sst";
import { Api } from "./stacks/Api";
import { Auth } from "./stacks/Auth";
import { Domain } from "./stacks/Domain";
import { Notification } from "./stacks/Notification";
import { Secrets } from "./stacks/Secrets";
import { SolidStart } from "./stacks/SolidStart";
import { Storage } from "./stacks/Storage";
import { Websocket } from "./stacks/Websocket";

export default {
  config(_input) {
    return {
      name: "plaaaner-com",
      region: "eu-central-1",
    };
  },
  stacks(app) {
    if (app.stage !== "production") {
      app.setDefaultRemovalPolicy("destroy");
    }
    app
      //
      .stack(Domain)
      .stack(Secrets)
      .stack(Storage)
      .stack(Notification)
      .stack(Websocket)
      .stack(Auth)
      .stack(Api)
      .stack(SolidStart);
  },
} satisfies SSTConfig;
