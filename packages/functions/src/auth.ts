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
      mode: "oauth",
      clientID: Config.GOOGLE_CLIENT_ID,
      clientSecret: Config.GOOGLE_CLIENT_SECRET,
      scope: "user:email profile email",
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
