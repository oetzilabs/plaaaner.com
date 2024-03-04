import { SSTConfig } from "sst";
import { Api } from "./stacks/Api";
import { Storage } from "./stacks/Storage";
import { Domain } from "./stacks/Domain";
import { SolidStart } from "./stacks/SolidStart";
import { Secrets } from "./stacks/Secrets";
import { Auth } from "./stacks/Auth";
import { Websocket } from "./stacks/Websocket";
import { Notification } from "./stacks/Notification";

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
