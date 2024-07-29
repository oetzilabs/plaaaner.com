/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "plaaaner-com",
      region: "eu-central-1",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        cloudflare: true,
        aws: {
          region: "eu-central-1",
        },
      },
    };
  },
  async run() {
    await import("./stacks/Secrets");
    const storage = await import("./stacks/Storage");
    const notification = await import("./stacks/Notification");
    const websocket = await import("./stacks/Websocket");
    const auth = await import("./stacks/Auth");
    const api = await import("./stacks/Api");
    const solidStart = await import("./stacks/SolidStart");

    return {
      storageArn: storage.bucket.arn,
      storageUrn: storage.bucket.urn,
      notificationArn: notification.notifications.arn,
      notificationUrn: notification.notifications.urn,
      websocket: websocket.ws.url,
      authUrl: auth.auth.authenticator.url,
      api: api.api.url,
      solidStartUrl: solidStart.solidStartApp.url,
    };
  },
});
// import { SSTConfig } from "sst";
// import { Api } from "./stacks/Api";
// import { Auth } from "./stacks/Auth";
// import { Domain } from "./stacks/Domain";
// import { Notification } from "./stacks/Notification";
// import { Secrets } from "./stacks/Secrets";
// import { SolidStart } from "./stacks/SolidStart";
// import { Storage } from "./stacks/Storage";
// import { Websocket } from "./stacks/Websocket";
// export default {
//   config(_input) {
//     return {
//       name: "plaaaner-com",
//       region: "eu-central-1",
//     };
//   },
//   stacks(app) {
//     if (app.stage !== "production") {
//       app.setDefaultRemovalPolicy("destroy");
//     }
//     app
//       //
//       .stack(Domain)
//       .stack(Secrets)
//       .stack(Storage)
//       .stack(Notification)
//       .stack(Websocket)
//       .stack(Auth)
//       .stack(Api)
//       .stack(SolidStart);
//   },
// } satisfies SSTConfig;
