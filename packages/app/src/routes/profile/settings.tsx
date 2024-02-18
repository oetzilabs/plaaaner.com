import { Account } from "@/components/settings/Account";
import { Billing } from "@/components/settings/Billing";
import { Messages } from "@/components/settings/Messages";
import { Notifications } from "@/components/settings/Notifications";
import { SessionList } from "@/components/settings/SessionList";
import { Workspaces } from "@/components/settings/Workspaces";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuthenticatedSession } from "@/lib/auth/util";
import { createAsync, useLocation } from "@solidjs/router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BellRing, HandCoins, KeyRound, Layout, MessagesSquare, User } from "lucide-solid";
import { createSignal, onMount } from "solid-js";
dayjs.extend(relativeTime);

export default function ProfileSettingsPage() {
  const lo = useLocation();
  const [tab, seTab] = createSignal("account");

  const session = createAsync(() => getAuthenticatedSession());

  onMount(() => {
    const t = lo.hash.replace("#", "");
    if (t) {
      seTab(t);
    }
  });

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8">
      <div class="flex flex-col gap-1  w-full">
        <div class="flex flex-row gap-2 items-center justify-between w-full">
          <Badge variant="secondary" class="w-max">
            Profile
          </Badge>
          <Badge variant="outline" class="w-max">
            Session: {session()?.id}
          </Badge>
        </div>
        <h1 class="text-3xl font-medium">Settings</h1>
      </div>
      <div class="flex flex-col items-start gap-2 w-full">
        <Tabs
          value={tab()}
          onChange={(t) => {
            seTab(t);
            location.hash = t;
          }}
          class="w-full py-0"
          orientation="vertical"
        >
          <TabsList class="w-max h-full">
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="account">
              <User class="w-4 h-4" />
              Account
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="sessions">
              <KeyRound class="w-4 h-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="workspaces">
              <Layout class="w-4 h-4" />
              Workspaces
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="billing">
              <HandCoins class="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="notifications">
              <BellRing class="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger class="border-b-0 border-r-2 items-center justify-start gap-2" value="messages">
              <MessagesSquare class="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>
          <TabsContent class="px-4 py-0 mt-0 flex flex-col w-full gap-8" value="account">
            <Account />
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="sessions">
            <SessionList />
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="workspaces">
            <Workspaces />
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="billing">
            <Billing />
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="notifications">
            <Notifications />
          </TabsContent>
          <TabsContent class="px-4 py-0 mt-0 w-full flex flex-col gap-8" value="messages">
            <Messages />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
