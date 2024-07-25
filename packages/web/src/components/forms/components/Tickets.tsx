import { Button } from "@/components/ui/button";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getDefaultFreeTicketType } from "@/lib/api/plans";
import { cn } from "@/lib/utils";
import { BaseTicketSchema, CreatePlanFormSchema } from "@/utils/schemas/plan";
import { createAsync } from "@solidjs/router";
import { Minus, Plus } from "lucide-solid";
import { For, Match, Show, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { Transition } from "solid-transition-group";
import { z } from "zod";
import { usePlanProvider } from "../CreatePlanProvider";
import { EditTicketForm } from "../EditTicketForm";

export const Tickets = () => {
  const plan = usePlanProvider();
  if (!plan) return null;

  const defaultFreeTicketType = createAsync(() => getDefaultFreeTicketType());

  const calculateRemainingTicketsQuantity = (ticket: z.infer<typeof BaseTicketSchema>): number => {
    const totalTickets = plan
      .newPlan()
      .tickets.filter((x) => x.ticket_type !== ticket.ticket_type)
      .reduce((acc, t) => acc + t.quantity, 0);
    const remainingTickets =
      plan.newPlan().capacity.capacity_type === "none"
        ? 0
        : parseInt(
            plan.newPlan().capacity.value as Exclude<
              z.infer<typeof CreatePlanFormSchema>["capacity"]["value"],
              "none" | number
            >,
          ) - totalTickets;
    if (ticket.ticket_type.payment_type === "FREE") {
      return remainingTickets;
    }
    const paidTickets = plan.newPlan().tickets.filter((t) => t.ticket_type.name.toLowerCase().startsWith("paid"));
    const remainingPaidTickets = paidTickets.reduce((acc, t) => acc + t.quantity, 0);
    return remainingPaidTickets;
  };

  const tooManyTicketsCheck = () => {
    const nc = plan.newPlan();
    if (!nc) {
      return {
        message: `You have not set a capacity yet.`,
        type: "error",
      };
    }
    const totalTickets = nc.tickets.reduce((acc, t) => acc + t.quantity, 0);
    const cp = nc.capacity;
    const cpt = cp.capacity_type;
    if (cpt === "none") {
      return {
        message: `You have not set a capacity for the ${nc.plan_type}.`,
        type: "error",
      };
    }
    const cpv = parseInt(String(cp.value));
    if (totalTickets === cpv) {
      return {
        message: `You have reached the maximum capacity of tickets for this ${nc.plan_type}.`,
        type: "success:done",
      } as const;
    }
    if (totalTickets > cpv) {
      return {
        message: `You have exceeded the maximum capacity of tickets for this ${nc.plan_type}.\nPlease reduce the quantity.`,
        type: "error",
      } as const;
    }
    const difference = cpv - totalTickets;
    return {
      message: `Note: You have ${difference} ticket${difference === 1 ? "" : "s"} left to set up.`,
      type: "success:unfinished",
    } as const;
  };

  return (
    <>
      <RadioGroup
        class="w-full flex flex-col gap-2"
        aria-label="Recommended Ticket Capacity"
        onChange={(v) => {
          if (v === "custom") {
            plan.setNewPlan((ev) => ({
              ...ev,
              capacity: {
                capacity_type: "custom",
                value: 1,
              },
            }));
            return;
          }
          if (v === "none") {
            plan.setNewPlan((ev) => ({
              ...ev,
              capacity: {
                capacity_type: "none",
                value: "none",
              },
            }));
            return;
          }
          const x = parseInt(v);
          if (!isNaN(x) && [50, 100, 200, 300].includes(x)) {
            type CapacityRecommended = Exclude<
              Exclude<ReturnType<typeof plan.newPlan>["capacity"]["value"], "custom" | "none">,
              number
            >;
            plan.setNewPlan((ev) => ({
              ...ev,
              capacity: {
                capacity_type: "recommended",
                value: String(x) as CapacityRecommended,
              },
            }));
          }
        }}
      >
        <RadioGroupLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          How many tickets are you planning to sell?
        </RadioGroupLabel>
        <div class="grid grid-cols-3 gap-2 w-full">
          <For each={["none", 50, 100, 200, 300, "custom"] as const}>
            {(value) => (
              <RadioGroupItem value={String(value)}>
                <RadioGroupItemLabel
                  class={cn(
                    "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer capitalize",
                    {
                      "bg-secondary":
                        (plan.newPlan().capacity.capacity_type === "recommended" &&
                          plan.newPlan().capacity.value === String(value)) ||
                        (plan.newPlan().capacity.capacity_type === "custom" && value === "custom") ||
                        (plan.newPlan().capacity.capacity_type === "none" && value === "none"),
                    },
                  )}
                >
                  {value} <RadioGroupItemControl class="hidden" />
                </RadioGroupItemLabel>
              </RadioGroupItem>
            )}
          </For>
        </div>
      </RadioGroup>
      <Show when={plan.newPlan().capacity.capacity_type === "custom"}>
        <TextFieldRoot
          class="w-full flex flex-col gap-2"
          aria-label="Tickets"
          value={String(plan.newPlan().capacity.value === "none" ? 0 : plan.newPlan().capacity.value)}
          onChange={(value) => {
            if (!value) return;
            const capacity = parseInt(value);
            if (isNaN(capacity)) return;

            plan.setNewPlan((ev) => ({
              ...ev,
              capacity: {
                capacity_type: "custom",
                value: capacity,
              },
            }));
          }}
        >
          <TextFieldLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Or choose a custom capacity
          </TextFieldLabel>
          <TextField type="number" min={0} step="1" />
        </TextFieldRoot>
      </Show>
      <Transition name="slide-fade-down">
        <Show when={["recommended", "custom"].includes(plan.newPlan().capacity.capacity_type)}>
          <div class="flex flex-col gap-4 ">
            <Separator />
            <div class="flex flex-col gap-2 py-2 w-full">
              <span class="text-sm font-medium leading-none">Type of Tickets</span>
              <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md p-2">
                <Table class="rounded-sm overflow-clip">
                  <TableCaption class="text-xs">Type of Tickets (e.g. VIP, Regular, etc.)</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <For each={["Shape", "Type", "Name", "Price", "Quantity", "Actions"] as const}>
                        {(header) => <TableCell class="text-sm font-medium leading-none">{header}</TableCell>}
                      </For>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <For each={plan.newPlan().tickets}>
                      {(ticket, index) => (
                        <TableRow class="last:rounded-b-sm last:overflow-clip">
                          <TableCell class="uppercase">{ticket.shape}</TableCell>
                          <TableCell class="uppercase">{ticket.ticket_type.name}</TableCell>
                          <TableCell>{ticket.name}</TableCell>
                          <TableCell>
                            {ticket.ticket_type.payment_type === "FREE" ? (
                              "Free"
                            ) : (
                              <div>
                                {ticket.price.toFixed(2)}{" "}
                                <Switch>
                                  <Match
                                    when={
                                      ticket.currency.currency_type === "OTHER" &&
                                      (ticket.currency as Exclude<
                                        z.infer<typeof BaseTicketSchema>["currency"],
                                        Exclude<
                                          z.infer<typeof BaseTicketSchema>["currency"],
                                          { currency_type: "OTHER" }
                                        >
                                      >)
                                    }
                                  >
                                    {(c) => c().value}
                                  </Match>
                                  <Match when={ticket.currency.currency_type !== "OTHER"}>
                                    {ticket.currency.currency_type.toUpperCase()}
                                  </Match>
                                </Switch>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{ticket.quantity}</TableCell>
                          <TableCell class="w-max">
                            <div class="flex flex-row justify-end w-max gap-2">
                              <EditTicketForm
                                ticket={ticket}
                                tickets={() => plan.newPlan().tickets}
                                freeAllowedTickets={() => calculateRemainingTicketsQuantity(ticket)}
                                onChange={(newTicket) => {
                                  plan.setNewPlan((ev) => {
                                    return {
                                      ...ev,
                                      tickets: ev.tickets.map((t, i) => {
                                        if (i === index()) {
                                          return newTicket;
                                        }
                                        return t;
                                      }),
                                    };
                                  });
                                }}
                              />
                              <Button
                                size="icon"
                                variant="destructive"
                                aria-label="Remove Ticket"
                                class="w-6 h-6"
                                onClick={() => {
                                  plan.setNewPlan((ev) => {
                                    return {
                                      ...ev,
                                      tickets: ev.tickets.filter((_, i) => i !== index()),
                                    };
                                  });
                                }}
                              >
                                <Minus class="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </For>
                  </TableBody>
                </Table>
              </div>
            </div>
            <div class="flex flex-row items-center justify-between gap-2 w-full">
              <div class="text-sm font-medium leading-none">
                <Switch>
                  <Match when={tooManyTicketsCheck().type === "error"}>
                    <div class="flex flex-col gap-1 text-rose-500">
                      <For each={tooManyTicketsCheck().message.split("\n")}>{(line) => <p>{line}</p>}</For>
                    </div>
                  </Match>
                  <Match when={tooManyTicketsCheck().type === "success:unfinished"}>
                    <div class="flex flex-col gap-1">
                      <For each={tooManyTicketsCheck().message.split("\n")}>{(line) => <p>{line}</p>}</For>
                    </div>
                  </Match>
                  <Match when={tooManyTicketsCheck().type === "success:done"}>{tooManyTicketsCheck().message}</Match>
                </Switch>
              </div>
              <div class="flex flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-label="Add Ticket"
                  class="flex flex-row items-center justify-center gap-2 w-max"
                  disabled={
                    plan.isCreating.pending ||
                    tooManyTicketsCheck().type === "error" ||
                    tooManyTicketsCheck().type === "success:done"
                  }
                  onClick={() => {
                    const nc = plan.newPlan();
                    const tickets = nc.tickets;
                    if (tickets.length >= 1 && tickets.some((t) => t.quantity === 0)) {
                      toast.info(`Please setup the existing tickets first`);
                      return;
                    }
                    const totalTickets = tickets.reduce((acc, t) => acc + t.quantity, 0);
                    const cp = nc.capacity;
                    const cpt = cp.capacity_type;
                    if (cpt === "none") {
                      toast.error("Error Adding Ticket", {
                        description: `You have not set a capacity for the ${plan.newPlan().plan_type}.`,
                      });
                      return;
                    }
                    const cpv = parseInt(String(cp.value));
                    if (totalTickets >= cpv) {
                      toast.error("Error Adding Ticket", {
                        description: `You have reached the maximum capacity of tickets for this ${
                          plan.newPlan().plan_type
                        }.`,
                      });
                      return;
                    }
                    plan.setNewPlan((ev) => {
                      const dtt = defaultFreeTicketType();
                      if (!dtt) return ev;
                      return {
                        ...ev,
                        tickets: [
                          ...ev.tickets,
                          {
                            ticket_type: dtt,
                            shape: "default",
                            name: "",
                            price: 0,
                            currency: {
                              currency_type: "FREE",
                            },
                            quantity: 0,
                          },
                        ],
                      };
                    });
                  }}
                >
                  Add Ticket
                  <Plus class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Show>
      </Transition>
    </>
  );
};
