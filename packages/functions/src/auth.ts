import { User } from "@/core/entities/users";
import { ApiHandler } from "sst/node/api";
import { Config } from "sst/node/config";
import { AuthHandler, GoogleAdapter } from "sst/node/future/auth";
import { error, getUser, json, sessions } from "./utils";

export const handler = AuthHandler({
  sessions,
  providers: {
    google: GoogleAdapter({
      mode: "oauth",
      clientID: Config.GOOGLE_CLIENT_ID,
      clientSecret: Config.GOOGLE_CLIENT_SECRET,
      scope: "user:email profile email",
    }),
  },
  callbacks: {
    auth: {
      async allowClient(clientID, redirect) {
        if (clientID !== "google") {
          return false;
        }
        return true;
      },
      async success(input, response) {
        if (input.provider === "google") {
          const email = input.tokenset.claims().email;
          if (!email) {
            console.error("No email found in tokenset", input.tokenset);
            return response.http({
              statusCode: 400,
              body: "No email found in tokenset",
            });
          }
          let user_ = await User.findByEmail(email);
          if (!user_) {
            user_ = await User.create({ email, name: email });
          }
          return response.session({
            type: "user",
            properties: {
              userID: user_.id,
            },
          });
        }
        throw new Error("Unknown provider");
      },
    },
  },
});

export const session = ApiHandler(async () => {
  const user = await getUser();
  if (!user) return error("No session");
  return json(user);
});
