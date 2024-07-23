import { Account } from "@/components/settings/Account";
import { Billing } from "@/components/settings/Billing";
import { Messages } from "@/components/settings/Messages";
import { Notifications } from "@/components/settings/Notifications";
import { SessionList } from "@/components/settings/SessionList";
import { Workspaces } from "@/components/settings/Workspaces";
import { Organizations } from "@/components/settings/Organizations";
import { Dangerzone } from "@/components/settings/Dangerzone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BellRing, Building, HandCoins, KeyRound, Layout, MessagesSquare, User, X } from "lucide-solid";
import { useSession } from "@/components/SessionProvider";
import { Show } from "solid-js";
import { NotLoggedIn } from "@/components/NotLoggedIn";
dayjs.extend(relativeTime);

export default function ProfileSettingsPage() {
  const session = useSession();
  return (
    <Show
      when={session && session().id !== null && session()}
      fallback={
        <div class="flex p-4 w-full h-full items-center justify-center">
          <div class="w-max h-max min-w-96">
            <NotLoggedIn />
          </div>
        </div>
      }
    >
      {(s) => (
        <div class="flex flex-col items-start grow w-full gap-0">
          <div class="flex flex-col items-start gap-2 w-full grow">
            <Tabs class="w-full py-0">
              <TabsList class="grow flex flex-row">
                <TabsTrigger class="border-b-2 items-center justify-start gap-2" value="account">
                  <User class="w-4 h-4" />
                  Account
                </TabsTrigger>
                <TabsTrigger class="border-b-2 items-center justify-start gap-2" value="sessions">
                  <KeyRound class="w-4 h-4" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger class="border-b-2 items-center justify-start gap-2" value="organizations">
                  <Building class="w-4 h-4" />
                  Organizations
                </TabsTrigger>
                <TabsTrigger class="border-b-2 items-center justify-start gap-2" value="workspaces">
                  <Layout class="w-4 h-4" />
                  Workspaces
                </TabsTrigger>
                <TabsTrigger class="border-b-2 items-center justify-start gap-2" value="billing">
                  <HandCoins class="w-4 h-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger class="border-b-2 items-center justify-start gap-2" value="notifications">
                  <BellRing class="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger class="border-b-2 items-center justify-start gap-2" value="messages">
                  <MessagesSquare class="w-4 h-4" />
                  Messages
                </TabsTrigger>
                <TabsTrigger
                  class="border-b-2 items-center justify-start gap-2 text-red-500"
                  value="dangerzone"
                >
                  <X class="w-4 h-4" />
                  Dangerzone
                </TabsTrigger>
              </TabsList>
              <div class="p-4 flex flex-col w-full grow">
                <TabsContent class="px-0 py-0 mt-0 flex flex-col w-full gap-8" value="account">
                  <Account session={s()} />
                </TabsContent>
                <TabsContent class="px-0 py-0 mt-0 w-full flex flex-col gap-8" value="sessions">
                  <SessionList session={s()} />
                </TabsContent>
                <TabsContent class="px-0 py-0 mt-0 w-full flex flex-col gap-8" value="organizations">
                  <Organizations session={s()} />
                </TabsContent>
                <TabsContent class="px-0 py-0 mt-0 w-full flex flex-col gap-8" value="workspaces">
                  <Workspaces session={s()} />
                </TabsContent>
                <TabsContent class="px-0 py-0 mt-0 w-full flex flex-col gap-8" value="billing">
                  <Billing />
                </TabsContent>
                <TabsContent class="px-0 py-0 mt-0 w-full flex flex-col gap-8" value="notifications">
                  <Notifications />
                </TabsContent>
                <TabsContent class="px-0 py-0 mt-0 w-full flex flex-col gap-8" value="messages">
                  <Messages />
                </TabsContent>
                <TabsContent class="px-0 py-0 mt-0 w-full flex flex-col gap-8" value="dangerzone">
                  <Dangerzone />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </Show>
  );
}
