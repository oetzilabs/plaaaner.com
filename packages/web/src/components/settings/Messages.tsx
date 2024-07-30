import { createAsync, revalidate, useAction, useSubmission } from "@solidjs/router";
import { BellDot, BellOff, User } from "lucide-solid";
import { createEffect, For } from "solid-js";
import { toast } from "solid-sonner";
import { getMessagingSettings } from "../../lib/api/messages";
import { getNotificationSettings } from "../../lib/api/notifications";
import { cn } from "../../lib/utils";
import { changeMessageSettings, changeNotificationSettings } from "../../utils/api/actions";
import { Button } from "../ui/button";

export const Messages = () => {
  const messagingSettings = createAsync(() => getMessagingSettings());

  const message_types = [
    {
      type: "anyone",
      icon: <BellDot class="w-4 h-4" />,
      description: "Anyone can message you.",
    },
    {
      type: "friends",
      icon: <User class="w-4 h-4" />,
      description: "Friends and mentions.",
    },
    {
      type: "no-one",
      icon: <BellOff class="w-4 h-4" />,
      description: "Turn off all messages.",
    },
  ];

  const _changeMessageSetting = useAction(changeMessageSettings);
  const isChangingMessageSettings = useSubmission(changeMessageSettings);

  createEffect(() => {
    if (isChangingMessageSettings.result) {
      toast.success("Notification settings updated");
    }
  });

  const handleMessageSettingChange = async (type: string) => {
    await _changeMessageSetting(type);

    await revalidate(getMessagingSettings.key);
  };

  return (
    <div class="flex flex-col items-start gap-8 w-full">
      <div class="flex flex-col items-start gap-2 w-full">
        <span class="text-lg font-semibold">Messages</span>
        <span class="text-sm text-muted-foreground">Choose who can message you.</span>
      </div>
      <div class="flex flex-col items-start gap-2 w-full">
        <div class="grid gap-1 w-full">
          <For each={message_types}>
            {(n) => (
              <button
                type="button"
                class={cn(
                  "flex flex-row items-center justify-start gap-6 w-full transition-all hover:bg-accent hover:text-accent-foreground py-2 px-4 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                  {
                    "bg-accent text-accent-foreground border border-neutral-300 dark:border-neutral-700 shadow-sm":
                      messagingSettings()?.type === n.type,
                  },
                )}
                disabled={isChangingMessageSettings.pending}
                onClick={() => handleMessageSettingChange(n.type)}
              >
                <div class="flex flex-row items-center gap-2">{n.icon}</div>
                <div class="flex flex-col gap-3 items-start justify-start w-full">
                  <span class="text-sm font-semibold capitalize">{n.type}</span>
                  <span class="text-xs text-muted-foreground">{n.description}</span>
                </div>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};
