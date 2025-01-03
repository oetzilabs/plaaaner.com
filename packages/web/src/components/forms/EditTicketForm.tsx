import { Pen } from "lucide-solid";
import { Accessor, Show, createSignal } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";
import { cn } from "../../lib/utils";
import { BaseTicketSchema } from "../../utils/schemas/plan";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemLabel,
  RadioGroupLabel,
} from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TextFieldRoot, TextFieldErrorMessage, TextField, TextFieldLabel } from "../ui/textfield";
import { createAsync } from "@solidjs/router";
import { getTicketTypes } from "../../lib/api/organizations";
import { createStore } from "solid-js/store";

export const EditTicketForm = (props: {
  ticket: z.infer<typeof BaseTicketSchema>;
  onChange: (ticket: z.infer<typeof BaseTicketSchema>) => void;
  tickets: Accessor<z.infer<typeof BaseTicketSchema>[]>;
  freeAllowedTickets: Accessor<number>;
}) => {
  const [ticket, setTicket] = createStore(props.ticket);

  const isDisabledTicket = (ticket_type_id: z.infer<typeof BaseTicketSchema>["ticket_type"]["id"]) => {
    return props.tickets().some((a) => a.ticket_type.id === ticket_type_id);
  };

  const stepsPerCurrency = (currency: z.infer<typeof BaseTicketSchema>["currency"]["currency_type"]) =>
    ((
      {
        USD: 0.01,
        EUR: 0.01,
        CHF: 0.05,
        OTHER: 0.01,
      } as Record<z.infer<typeof BaseTicketSchema>["currency"]["currency_type"], number>
    )[currency]);

  const getTickets = createAsync(() => getTicketTypes(), { deferStream: true });

  const getCurrencies = () => {
    return [
      { value: "USD", label: "USD" },
      { value: "EUR", label: "EUR" },
      { value: "CHF", label: "CHF" },
      { value: "OTHER", label: "Other" },
    ] as {
      value: z.infer<typeof BaseTicketSchema>["currency"]["currency_type"];
      label: string;
    }[];
  };

  return (
    <Dialog>
      <DialogTrigger as={Button} variant="secondary" size="icon" class="w-6 h-6">
        <Pen class="w-3 h-3" />
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogDescription>
          <div class="flex flex-col gap-2 w-full">
            <div class="flex flex-col gap-2 w-full">
              <RadioGroup
                value={ticket.shape}
                aria-label="What shape do you want the ticket to look like?"
                onChange={(value) => {
                  const v = value as (typeof ticket)["shape"];
                  setTicket((ev) => {
                    return {
                      ...ev,
                      shape: v,
                    };
                  });
                }}
                class="w-full flex flex-col gap-2"
              >
                <RadioGroupLabel class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  What shape do you want the ticket to look like?
                </RadioGroupLabel>
                <div class="grid grid-cols-2 gap-2 w-full">
                  <RadioGroupItem value="default">
                    <RadioGroupItemLabel
                      class={cn(
                        "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                        {
                          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70": ticket.shape !== "default",
                          "bg-secondary": ticket.shape === "default",
                        }
                      )}
                    >
                      Default <RadioGroupItemControl class="hidden" />
                    </RadioGroupItemLabel>
                  </RadioGroupItem>
                  <RadioGroupItem value="default-1">
                    <RadioGroupItemLabel
                      class={cn(
                        "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                        {
                          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70": ticket.shape !== "default-1",
                          "bg-secondary": ticket.shape === "default-1",
                        }
                      )}
                    >
                      Default 1 <RadioGroupItemControl class="hidden" />
                    </RadioGroupItemLabel>
                  </RadioGroupItem>
                  <RadioGroupItem value="default-2">
                    <RadioGroupItemLabel
                      class={cn(
                        "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                        {
                          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70": ticket.shape !== "default-2",
                          "bg-secondary": ticket.shape === "default-2",
                        }
                      )}
                    >
                      Default 2<RadioGroupItemControl class="hidden" />
                    </RadioGroupItemLabel>
                  </RadioGroupItem>
                  <RadioGroupItem value="custom">
                    <RadioGroupItemLabel
                      class={cn(
                        "flex flex-col items-center justify-between gap-2 w-full bg-transparent border border-neutral-200 dark:border-neutral-800 rounded p-4 text-sm font-medium leading-none cursor-pointer",
                        {
                          "peer-disabled:cursor-not-allowed peer-disabled:opacity-70": ticket.shape !== "custom",
                          "bg-secondary": ticket.shape === "custom",
                        }
                      )}
                    >
                      Custom <RadioGroupItemControl class="hidden" />
                    </RadioGroupItemLabel>
                  </RadioGroupItem>
                </div>
              </RadioGroup>
            </div>
            <div class="flex flex-col gap-2 w-full">
              <span>Ticket Type</span>
              <Show
                when={
                  getTickets() !== undefined &&
                  getTickets()!
                    .filter((t) => !t.name.startsWith("default"))
                    .map((t) => ({
                      value: t.id,
                      label: t.name,
                      disabled: isDisabledTicket(t.id),
                    }))
                }
              >
                {(tickets) => (
                  <Select
                    optionValue="value"
                    optionTextValue="label"
                    options={tickets()}
                    placeholder="Select a ticket type"
                    optionDisabled="disabled"
                    itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>}
                    value={tickets().find((t) => t.value === ticket.ticket_type.id)}
                    onChange={(value) => {
                      if (!value) {
                        return;
                      }
                      setTicket((t) => {
                        return {
                          ...t,
                          ticket_type: getTickets()!.find((t) => t.id === value.value)!,
                        };
                      });
                    }}
                    class="w-full"
                  >
                    <SelectTrigger class="w-full">
                      <SelectValue<{
                        value: string;
                        label: string;
                        disabled: boolean;
                      }>>
                        {(state) => state.selectedOption().label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                )}
              </Show>
            </div>
            <TextFieldRoot
              class="w-full flex flex-col gap-2"
              aria-label="Ticket Name"
              onChange={(name) => {
                if (!name) return;
                setTicket("name", name);
              }}
            >
              <TextFieldLabel class="flex flex-col gap-2 w-full">
                <span>Name</span>
                <TextField value={ticket.name} />
              </TextFieldLabel>
            </TextFieldRoot>
            <Show when={ticket.ticket_type.payment_type === "PAID"}>
              <div class="flex flex-row items-center justify-between gap-2 w-full">
                <TextFieldRoot
                  class="w-full flex flex-col gap-2"
                  aria-label="Ticket Price"
                  onChange={(p) => {
                    if (!p) return;
                    const price = parseFloat(p);
                    if (isNaN(price)) return;
                    setTicket("price", price);
                  }}
                >
                  <TextFieldLabel class="flex flex-col gap-2 w-full">
                    <span>Price</span>
                    <TextField
                      type="number"
                      min={0}
                      step={stepsPerCurrency(ticket.currency.currency_type)}
                      value={ticket.price}
                    />
                  </TextFieldLabel>
                </TextFieldRoot>
                <div class="flex flex-col gap-2 w-full">
                  <span>Currency</span>
                  <div class="flex flex-row items-center justify-between gap-2 w-full">
                    <Select
                      optionValue="value"
                      optionTextValue="label"
                      options={getCurrencies()}
                      placeholder="Select a currency"
                      itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>}
                      value={getCurrencies().find((t) => t.value === ticket.currency.currency_type)}
                      onChange={(value) => {
                        if (!value) return;
                        setTicket("currency", {
                          currency_type: value.value,
                          value: "",
                        });
                      }}
                      class="w-full"
                    >
                      <SelectTrigger class="w-full">
                        <SelectValue<ReturnType<typeof getCurrencies>[number]>>
                          {(state) => state.selectedOption().label}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent />
                    </Select>
                    <Show when={ticket.currency.currency_type === "OTHER" && ticket.currency} keyed>
                      {(c) => (
                        <TextFieldRoot
                          class="w-full flex flex-col gap-2"
                          aria-label="Ticket Currency"
                          value={c.value ?? ""}
                          onChange={(curr) => {
                            if (!curr) return;
                            setTicket("currency", {
                              currency_type: "OTHER",
                              value: curr.toUpperCase(),
                            });
                          }}
                        >
                          <TextField class="uppercase" />
                        </TextFieldRoot>
                      )}
                    </Show>
                  </div>
                </div>
              </div>
            </Show>
            <TextFieldRoot
              class="w-full flex flex-col gap-2"
              aria-label="Ticket Quantity"
              onChange={(value) => {
                if (!value) return;
                const quantity = parseInt(value);
                if (isNaN(quantity)) return;
                setTicket("quantity", quantity);
              }}
            >
              <TextFieldLabel class="flex flex-col gap-2 w-full">
                <span>Quantity</span>
                <TextField type="number" min={0} step="1" value={ticket.quantity} max={props.freeAllowedTickets()} />
                <Show when={ticket.quantity > props.freeAllowedTickets()}>
                  <TextFieldErrorMessage>
                    Quantity can't be greater than {props.freeAllowedTickets()}
                  </TextFieldErrorMessage>
                </Show>
              </TextFieldLabel>
            </TextFieldRoot>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="default"
            onClick={() => {
              const quantity = ticket.quantity;
              if (quantity > props.freeAllowedTickets()) {
                toast.info("Quantity can't be greater than available tickets");
                return;
              }
              props.onChange(ticket);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
