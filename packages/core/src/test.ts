import { Validbot_Users } from "./entities/valibot/users";

async function main() {
  const test = await Validbot_Users.findByEmail("oezguerisbert@gmail.com");
  if (!test) {
    throw new Error("User not found");
  }
  const updated = await Validbot_Users.update({
    id: test.id,
    email: "oezguerisbert@gmail.com",
    name: "Özgür",
  });

  if (!updated) {
    throw new Error("User not updated");
  }
  console.log({ test, updated });
}

main().catch((e) => {
  console.error(e);
});

process.on("unhandledRejection", (e) => {
  console.error(e);
  process.exit(1);
});
