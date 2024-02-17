import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextField, TextFieldInput, TextFieldLabel } from "@/components/ui/textfield";
import { getWorkspaces } from "@/lib/api/workspaces";
import { getAuthenticatedUser } from "@/lib/auth/util";
import { cn } from "@/lib/utils";
import { A, createAsync } from "@solidjs/router";
import { createMutation } from "@tanstack/solid-query";
import { For, Match, Switch, createSignal } from "solid-js";
import { Card, CardContent } from "../../components/ui/card";
import { As } from "@kobalte/core";

export default function ProfileSettingsPage() {
  const user = createAsync(() => getAuthenticatedUser());
  const workspaces = createAsync(() => getWorkspaces());
  const [email, setEmail] = createSignal(user()?.email);
  const saveUserMutation = createMutation(() => ({
    mutationKey: ["saveUser"],
    mutationFn: async (email: string) => {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      return res.json();
    },
  }));

  return (
    <div class="flex flex-col items-start h-full w-full py-10 gap-8">
      <div class="flex flex-col gap-1">
        <Badge variant="secondary" class="w-max">
          Profile
        </Badge>
        <h1 class="text-3xl font-medium">Settings</h1>
      </div>
      <Switch>
        <Match when={!user()}>
          <div>Loading...</div>
        </Match>
        <Match when={user()}>
          <div class="flex flex-col items-start gap-2 w-full">
            <Tabs defaultValue="account" class="w-full py-0" orientation="vertical">
              <TabsList>
                <TabsTrigger class="border-b-0 border-r-2" value="account">
                  Account
                </TabsTrigger>
                <TabsTrigger class="border-b-0 border-r-2" value="workspaces">
                  Workspaces
                </TabsTrigger>
              </TabsList>
              <TabsContent class="px-4 py-0 mt-0 w-full gap-4" value="account">
                <span class="text-muted-foreground">Make changes to your account here.</span>
                <form class="flex flex-col gap-4 items-start w-full py-4">
                  <TextField
                    class="w-max flex flex-col gap-2"
                    onChange={(v) => {
                      setEmail(v);
                    }}
                    value={email()}
                  >
                    <TextFieldLabel class="">Email</TextFieldLabel>
                    <TextFieldInput
                      id="email"
                      placeholder="Email"
                      type="email"
                      autoCapitalize="none"
                      autocomplete="email"
                      autocorrect="off"
                      class="w-max min-w-[600px] max-w-[600px]"
                      disabled={saveUserMutation.isPending}
                    />
                  </TextField>
                  <Button
                    variant="default"
                    size="sm"
                    type="submit"
                    class={cn("w-max", {
                      "opacity-50 cursor-not-allowed": saveUserMutation.isPending,
                    })}
                    aria-busy={saveUserMutation.isPending}
                    aria-label="Continue with Email"
                    disabled={saveUserMutation.isPending}
                  >
                    <span>Save</span>
                  </Button>
                </form>
              </TabsContent>
              <TabsContent class="px-4 py-0 mt-0 w-full gap-4" value="workspaces">
                <span class="text-muted-foreground">Set up your workspaces here.</span>
                <Switch>
                  <Match when={!workspaces()}>
                    <div>Loading...</div>
                  </Match>
                  <Match when={workspaces()}>
                    {(ws) => (
                      <Switch>
                        <Match when={ws.length === 0}>
                          <div class="flex flex-col items-start gap-2 w-full">
                            <span class="text-lg font-semibold">No workspaces</span>
                            <span class="text-sm text-muted-foreground">Create a new workspace</span>
                            <Button variant="default" size="sm" type="submit" class="w-max" asChild>
                              <As component={A} href="/workspaces/new">
                                <span>Create workspace</span>
                              </As>
                            </Button>
                          </div>
                        </Match>
                        <Match when={ws.length > 0}>
                          <div class="flex flex-col items-start gap-2 w-full">
                            <span class="text-lg font-semibold">Workspaces</span>
                            <span class="text-sm text-muted-foreground">Manage your workspaces</span>
                            <For each={ws()}>
                              {(workspace) => {
                                return (
                                  <Card>
                                    <CardContent>
                                      <span class="text-lg font-semibold">{workspace.name}</span>
                                    </CardContent>
                                  </Card>
                                );
                              }}
                            </For>
                          </div>
                        </Match>
                      </Switch>
                    )}
                  </Match>
                </Switch>
              </TabsContent>
            </Tabs>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
