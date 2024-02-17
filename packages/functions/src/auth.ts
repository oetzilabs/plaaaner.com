import { User } from "@/core/entities/users";
import { ApiHandler } from "sst/node/api";
import { Config } from "sst/node/config";
import { AuthHandler, CodeAdapter, GoogleAdapter } from "sst/node/future/auth";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { error, getUser, json, sessions } from "./utils";
import { z } from "zod";
import { withActor } from "@/core/actor";

const ses = new SESv2Client({});

export const handler = AuthHandler({
  sessions,
  providers: {
    google: GoogleAdapter({
      clientID: Config.GOOGLE_CLIENT_ID,
      mode: "oidc",
    }),
    email: CodeAdapter({
      async onCodeRequest(code, claims) {
        return withActor(
          {
            type: "public",
            properties: {},
          },
          async () => {
            console.log("sending email to", claims);
            console.log("code", code);
            const email = z.string().email().safeParse(claims.email);
            if (!email.success) {
              return {
                statusCode: 302,
                headers: {
                  Location: process.env.AUTH_FRONTEND_URL + "/auth/email",
                },
              };
            }

            if (!process.env.IS_LOCAL) {
              // TODO!: implement a better way to verify the email, and botspam.
              const ok = true;
              if (!ok)
                return {
                  statusCode: 302,
                  headers: {
                    Location: process.env.AUTH_FRONTEND_URL + "/auth/email",
                  },
                };
              console.log("challenge verified");
              const cmd = new SendEmailCommand({
                Destination: {
                  ToAddresses: [email.data],
                },
                FromEmailAddress: `Plaaaner <mail@${process.env.EMAIL_DOMAIN}>`,
                Content: {
                  Simple: {
                    Body: {
                      Html: {
                        Data: `Your pin code is <strong>${code}</strong>`,
                      },
                      Text: {
                        Data: `Your pin code is ${code}`,
                      },
                    },
                    Subject: {
                      Data: "SST Console Pin Code: " + code,
                    },
                  },
                },
              });
              await ses.send(cmd);
            }

            return {
              statusCode: 302,
              headers: {
                Location:
                  process.env.AUTH_FRONTEND_URL +
                  "/auth/code?" +
                  new URLSearchParams({ email: claims.email }).toString(),
              },
            };
          }
        );
      },
      async onCodeInvalid() {
        return {
          statusCode: 302,
          headers: {
            Location: process.env.AUTH_FRONTEND_URL + "/auth/code?error=invalid_code",
          },
        };
      },
    }),
  },
  callbacks: {
    error: async (e) => {
      console.log("upps error: ", e);
      return {
        statusCode: 302,
        headers: {
          Location: process.env.AUTH_FRONTEND_URL + "/auth/error?error=unknwown",
        },
      };
    },
    auth: {
      async allowClient(clientID, redirect) {
        if (clientID !== "google") {
          return false;
        }
        return true;
      },
      async success(input, response) {
        if (input.provider === "google") {
          const claims = input.tokenset.claims();
          const email = claims.email;
          const name = claims.name;
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
            console.log("created user", user_);
          } else {
            console.log("found user", user_);
          }
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
