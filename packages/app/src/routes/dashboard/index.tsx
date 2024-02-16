import { auth, authLoggedin } from "@/components/providers/Authentication";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Queries } from "@/utils/api/queries";
import { Skeleton } from "@kobalte/core/dist/types/skeleton/skeleton";
import { createQuery } from "@tanstack/solid-query";
import { Switch, Match } from "solid-js";

export default function DashboardPage() {
  const dashboard = createQuery(() => ({
    queryKey: ["dashboard"],
    queryFn: async () => {
      return Queries.Dashboard.get();
    },
    get enabled() {
      const a = authLoggedin();
      return a;
    }
  }));

  return (
    <div class="flex flex-col gap-8">
      <Switch>
        <Match when={authLoggedin() && auth()}>
          {(user) => (
            <div class="flex flex-col gap-8">
              <div class="flex flex-col gap-2">
                <h1 class="text-2xl font-medium">Welcome back, {user.name}</h1>
                <span class="text-xs text-neutral-500">
                  Here's what's happening with your workspace today.
                </span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Plans</CardTitle>
                    <CardDescription>Total plans</CardDescription>
                  </CardHeader>
                  <CardContent class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                      <span class="text-lg font-medium">1</span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <span class="text-lg font-medium">+100%</span>
                      <span class="text-xs text-neutral-500">This month</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Tickets</CardTitle>
                    <CardDescription>Total tickets</CardDescription>
                  </CardHeader>
                  <CardContent class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                      <span class="text-lg font-medium">220</span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <span class="text-lg font-medium">+100%</span>
                      <span class="text-xs text-neutral-500">This month</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue</CardTitle>
                    <CardDescription>Total revenue</CardDescription>
                  </CardHeader>
                  <CardContent class="flex flex-col gap-4">
                    <div class="flex flex-col gap-2">
                      <span class="text-lg font-medium">5000</span>
                    </div>
                    <div class="flex flex-col gap-2">
                      <span class="text-lg font-medium">+100%</span>
                      <span class="text-xs text-neutral-500">This month</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </Match>
        <Match when={!authLoggedin()}>
          <div class="flex flex-col gap-8">
            <div class="flex flex-col gap-2">
              <h1>Welcome back, please wait...</h1>
              <Skeleton class="w-full h-10" />
            </div>
            <div class="grid grid-cols-3 gap-4">
              <Skeleton class="w-full h-10" />
              <Skeleton class="w-full h-10" />
              <Skeleton class="w-full h-10" />
            </div>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
