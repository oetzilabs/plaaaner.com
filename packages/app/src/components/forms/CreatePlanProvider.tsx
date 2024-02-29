import { ArrowLeft } from "lucide-solid";
import { createNewEvent, getEventTypeId, getPreviousEvents, getRecommendedEvents } from "@/lib/api/events";
import { CreateEventFormSchema } from "@/utils/schemas/event";
import { Button } from "@/components/ui/button";
import { createContextProvider } from "@solid-primitives/context";
import { createUndoHistory } from "@solid-primitives/history";
import { createAsync, useAction, useSubmission } from "@solidjs/router";
import dayjs from "dayjs";
import { createMemo, createSignal } from "solid-js";
import { z } from "zod";
import { Skeleton } from "../ui/skeleton";
import { Sidebar } from "./components/Sidebar";
import { Form } from "./components/Form";

type EventFormSchema = z.infer<typeof CreateEventFormSchema>;

type DefaultEventFunction = (event_type: EventFormSchema["event_type"]) => EventFormSchema;

export const DEFAULT_PLAN: DefaultEventFunction = (event_type) => ({
  event_type,
  name: "",
  description: "",
  days: [dayjs().startOf("day").toDate(), dayjs().startOf("day").add(1, "day").toDate()],
  time_slots: {
    [dayjs().startOf("day").format("YYYY-MM-DD")]: {
      [dayjs().startOf("day").format("YYYY-MM-DD h:mm A")]: {
        start: dayjs().startOf("day").toDate(),
        end: dayjs().endOf("day").toDate(),
      },
    },
  },
  tickets: [],
  capacity: {
    capacity_type: "none",
    value: "none",
  },
  location: {
    location_type: "other",
    details: "",
  },
});

type CreatePlanProviderProps = {
  event_type: EventFormSchema["event_type"];
};

export type TabValue = "general" | "time" | "location" | "tickets";

export const TabMovement: Record<"forward" | "backward", Record<TabValue, TabValue | undefined>> = {
  forward: {
    general: "time",
    time: "location",
    location: "tickets",
    tickets: undefined,
  },
  backward: {
    general: undefined,
    time: "general",
    location: "time",
    tickets: "location",
  },
};

export const [CreatePlanProvider, usePlanProvider] = createContextProvider((props: CreatePlanProviderProps) => {
  const previousPlans = createAsync(() => getPreviousEvents(), { deferStream: true });
  const recommendedPlans = createAsync(() => getRecommendedEvents(), { deferStream: true });
  const event_type_id = createAsync(() => getEventTypeId(props.event_type), { deferStream: true });
  const createPlan = useAction(createNewEvent);
  const isCreating = useSubmission(createNewEvent);

  const [newPlan, setNewPlan] = createSignal<z.infer<typeof CreateEventFormSchema>>(DEFAULT_PLAN(props.event_type));
  const [trackClearEvent, clearEventHistory] = createSignal(undefined, { equals: false });
  const eventHistory = createMemo(() => {
    // track what should rerun the memo
    trackClearEvent();
    return createUndoHistory(
      () => {
        const v = newPlan();
        return () => {
          setNewPlan(v);
        };
      },
      {
        limit: 1000,
      }
    );
  });

  const suggestNewNames = () => {
    const ne = newPlan();
    if (!ne) {
      return [];
    }
    const name = ne.name;
    const pE = previousPlans();
    if (!pE) {
      return [];
    }
    if (name.length === 0) {
      return [];
    }
    // is the name already in the list?
    const existsStartingWithLowerCase = pE.find((pPlan) => pPlan.name.toLowerCase().startsWith(name.toLowerCase()));
    const existsExactLowercase = pE.find((pPlan) => pPlan.name.toLowerCase() === name.toLowerCase());

    if (!existsExactLowercase) {
      return [];
    }
    if (!existsStartingWithLowerCase) {
      return [];
    }
    const lastCounter = pE.reduce((acc, pPlan) => {
      const pPlanName = pPlan.name.toLowerCase();

      // find the last number in the name, if it exists. the name can be "name-1" or "name 1" or even "name1"
      const lastNumber = pPlanName.match(/(\d+)$/);

      if (lastNumber) {
        const counter = parseInt(lastNumber[0]);
        if (counter > acc) {
          return counter;
        }
      }
      return acc;
    }, 0);

    if (lastCounter === 0) {
      return [];
    }

    const suggestions = [];
    const nameWithoutCounter = name.replace(/(\d+)$/, "").trim();

    for (let i = 1; i < 4; i++) {
      suggestions.push(`${nameWithoutCounter} ${lastCounter + i}`);
    }

    return suggestions;
  };

  return {
    suggestNewNames,
    newPlan,
    setNewPlan,
    previousPlans,
    recommendedPlans,
    event_type_id,
    createPlan,
    isCreating: isCreating,
    clearEventHistory,
    eventHistory,
  };
});

const Title = () => {
  const event = usePlanProvider();
  if (!event) return <Skeleton class="w-40 h-8" />;
  return <h1 class="text-3xl font-semibold w-full capitalize">Create {event.newPlan().event_type}</h1>;
};

export const isFormEmpty = (plan: EventFormSchema) => {
  return JSON.stringify(plan) === JSON.stringify(DEFAULT_PLAN(plan.event_type));
};

export const CreatePlan = (props: CreatePlanProviderProps) => {
  const [currentTab, setCurrentTab] = createSignal<TabValue>("general");
  let formRef: HTMLFormElement;

  return (
    <CreatePlanProvider event_type={props.event_type}>
      <div class="flex flex-col gap-4 items-start w-full">
        <div class="flex flex-col">
          <Button
            variant="secondary"
            size="sm"
            class="w-max gap-2"
            onClick={() => {
              history.back();
            }}
          >
            <ArrowLeft class="size-4" />
            Back
          </Button>
        </div>
        <Title />
        <div class="flex flex-col-reverse lg:flex-row lg:justify-between gap-8 py-4 w-full">
          <Form formRef={formRef!} currentTab={currentTab} setCurrentTab={setCurrentTab} />
          <Sidebar formRef={formRef!} />
        </div>
      </div>
    </CreatePlanProvider>
  );
};
