import { z } from "zod";
import { TicketSchema } from "../../utils/schemas/concert";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "../ui/select";
import { TextField, TextFieldErrorMessage, TextFieldInput, TextFieldLabel, labelVariants } from "../ui/textfield";
import { Accessor, createEffect, createSignal } from "solid-js";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { As } from "@kobalte/core";
import { Pen } from "lucide-solid";
import { cn } from "../../lib/utils";
import { Show } from "solid-js";
import { toast } from "solid-sonner";

export const EditTicketForm = (props: {
  ticket: z.infer<typeof TicketSchema>;
  onChange: (ticket: z.infer<typeof TicketSchema>) => void;
  tickets: Accessor<z.infer<typeof TicketSchema>[]>;
  freeAllowedTickets: Accessor<number>;
}) => {
  const [ticket, setTicket] = createSignal(props.ticket);

  const isDisabledTicket = (ticket_type: z.infer<typeof TicketSchema>["ticket_type"]) => {
    return props.tickets().some((a) => a.ticket_type === ticket_type);
  };

  const stepsPerCurrency = (currency: z.infer<typeof TicketSchema>["currency"]["currency_type"]) =>
    ((
      {
        usd: 0.01,
        eur: 0.01,
        chf: 0.05,
        other: 0.01,
      } as Record<z.infer<typeof TicketSchema>["currency"]["currency_type"], number>
    )[currency]);

  const getTickets = () => {
    return [
      { value: "free", label: "Free", disabled: isDisabledTicket("free") },
      { value: "free:vip", label: "Free: VIP", disabled: isDisabledTicket("free:vip") },
      { value: "paid:vip", label: "Paid: VIP", disabled: isDisabledTicket("paid:vip") },
      { value: "paid:regular", label: "Paid: Regular", disabled: isDisabledTicket("paid:regular") },
      { value: "paid:student", label: "Paid: Student", disabled: isDisabledTicket("paid:student") },
    ] as {
      value: z.infer<typeof TicketSchema>["ticket_type"];
      label: string;
      disabled: boolean;
    }[];
  };

  const getCurrencies = () => {
    return [
      { value: "usd", label: "USD" },
      { value: "eur", label: "EUR" },
      { value: "chf", label: "CHF" },
      { value: "other", label: "Other" },
    ] as {
      value: z.infer<typeof TicketSchema>["currency"]["currency_type"];
      label: string;
    }[];
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <As component={Button} variant="secondary" size="icon" class="w-6 h-6">
          <Pen class="w-3 h-3" />
        </As>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Edit Ticket</DialogTitle>
        <DialogDescription>
          <div class="flex flex-col gap-2 w-full">
            <div class="flex flex-col gap-2 w-full">
              <span>Ticket Type</span>
              <Select
                optionValue="value"
                optionTextValue="label"
                options={getTickets()}
                placeholder="Select a ticket type"
                optionDisabled="disabled"
                itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>}
                value={getTickets().find((t) => t.value === ticket().ticket_type)}
                onChange={(value) => {
                  if (!value) {
                    return;
                  }
                  setTicket((t) => {
                    return {
                      ...t,
                      ticket_type: value.value,
                    };
                  });
                }}
                class="w-full"
              >
                <SelectTrigger class="w-full">
                  <SelectValue<ReturnType<typeof getTickets>[number]>>
                    {(state) => state.selectedOption().label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>
            <TextField class="w-full flex flex-col gap-2" aria-label="Ticket Name">
              <TextFieldLabel class="flex flex-col gap-2 w-full">
                <span>Name</span>
                <TextFieldInput
                  value={ticket().name}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    if (!value) return;
                    setTicket((t) => {
                      return {
                        ...t,
                        name: value,
                      };
                    });
                  }}
                />
              </TextFieldLabel>
            </TextField>
            <Show when={ticket().ticket_type.startsWith("paid")}>
              <div class="flex flex-row items-center justify-between gap-2 w-full">
                <TextField class="w-full flex flex-col gap-2" aria-label="Ticket Price">
                  <TextFieldLabel class="flex flex-col gap-2 w-full">
                    <span>Price</span>
                    <TextFieldInput
                      type="number"
                      min={0}
                      step={stepsPerCurrency(ticket().currency.currency_type)}
                      value={ticket().price}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        if (!value) return;
                        const price = parseFloat(value);
                        if (isNaN(price)) return;

                        setTicket((t) => {
                          return {
                            ...t,
                            price,
                          };
                        });
                      }}
                    />
                  </TextFieldLabel>
                </TextField>
                <div class="flex flex-col gap-2 w-full">
                  <span class={cn(labelVariants())}>Currency</span>
                  <div class="flex flex-row items-center justify-between gap-2 w-full">
                    <Select
                      optionValue="value"
                      optionTextValue="label"
                      options={getCurrencies()}
                      placeholder="Select a currency"
                      itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>}
                      value={getCurrencies().find((t) => t.value === ticket().currency.currency_type)}
                      onChange={(value) => {
                        if (!value) {
                          return;
                        }
                        if (value.value === "other") {
                          setTicket((t) => {
                            return {
                              ...t,
                              currency: {
                                currency_type: value.value,
                                value: "",
                              },
                            };
                          });
                        } else {
                          setTicket((t) => {
                            return {
                              ...t,
                              currency: {
                                currency_type: value.value,
                                value: "",
                              },
                            };
                          });
                        }
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
                    <Show
                      when={
                        ticket().currency.currency_type === "other" &&
                        (ticket().currency as Exclude<
                          z.infer<typeof TicketSchema>["currency"],
                          Exclude<z.infer<typeof TicketSchema>["currency"], { currency_type: "other" }>
                        >)
                      }
                    >
                      {(c) => (
                        <TextField class="w-full flex flex-col gap-2" aria-label="Ticket Currency">
                          <TextFieldInput
                            value={c().value ?? ""}
                            class="uppercase"
                            onChange={(e) => {
                              const value = e.currentTarget.value;
                              if (!value) return;
                              setTicket((t) => {
                                return {
                                  ...t,
                                  currency: {
                                    ...t.currency,
                                    value: value.toUpperCase(),
                                  },
                                };
                              });
                            }}
                          />
                        </TextField>
                      )}
                    </Show>
                  </div>
                </div>
              </div>
            </Show>
            <TextField class="w-full flex flex-col gap-2" aria-label="Ticket Quantity">
              <TextFieldLabel class="flex flex-col gap-2 w-full">
                <span>Quantity</span>
                <TextFieldInput
                  type="number"
                  min={0}
                  step="1"
                  value={ticket().quantity}
                  max={props.freeAllowedTickets()}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    if (!value) return;
                    const quantity = parseInt(value);
                    if (isNaN(quantity)) return;

                    setTicket((t) => {
                      return {
                        ...t,
                        quantity,
                      };
                    });
                  }}
                />
                <Show when={ticket().quantity > props.freeAllowedTickets()}>
                  <TextFieldErrorMessage>
                    Quantity can't be greater than {props.freeAllowedTickets()}
                  </TextFieldErrorMessage>
                </Show>
              </TextFieldLabel>
            </TextField>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="default"
            onClick={() => {
              const quantity = ticket().quantity;
              if (quantity > props.freeAllowedTickets()) {
                toast.info("Quantity can't be greater than available tickets");
                return;
              }
              props.onChange(ticket());
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
