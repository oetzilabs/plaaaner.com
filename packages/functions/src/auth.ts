import { User } from "@/core/entities/users";
import { Config } from "sst/node/config";
import { AuthHandler, GoogleAdapter } from "sst/node/future/auth";
import { sessions } from "./utils";

export const handler = AuthHandler({
  sessions,
  providers: {
    google: GoogleAdapter({
      clientID: Config.GOOGLE_CLIENT_ID,
      prompt: "select_account",
      mode: "oidc",
    }),
  },
  callbacks: {
    error: async (e) => {
      console.log("upps error: ", e);
      return {
        statusCode: 302,
        headers: {
          Location: process.env.AUTH_FRONTEND_URL + "/auth/error?error=unknown",
        },
      };
    },
    auth: {
      async allowClient(clientID, redirect) {
        console.log(redirect);
        const clients = ["google"];
        if (!clients.includes(clientID)) {
          return false;
        }

        return true;
      },
      async error(error) {
        console.log("auth-error", error);
        return {
          statusCode: 302,
          headers: {
            Location: process.env.AUTH_FRONTEND_URL + "/auth/error?error=unknown",
          },
        };
      },
      async success(input, response) {
        if (input.provider === "google") {
          const claims = input.tokenset.claims();
          const email = claims.email;
          const name = claims.preferred_username ?? claims.name;
          if (!email || !name) {
            console.error("No email or name found in tokenset", input.tokenset);
            return response.http({
              statusCode: 400,
              body: "No email found in tokenset",
            });
          }
          let user_ = await User.findByEmail(email);
          if (!user_) {
            user_ = await User.create({ email, name });
          }

          await User.update({ id: user_.id, deletedAt: null });

          return response.session({
            type: "user",
            properties: {
              id: user_.id,
              email: user_.email,
            },
          });
        }
        throw new Error("Unknown provider");
      },
    },
  },
});
