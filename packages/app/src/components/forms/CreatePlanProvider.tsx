import { ArrowLeft } from "lucide-solid";
import { createNewPlan, getPlanTypeId, getPreviousPlans, getRecommendedPlans } from "@/lib/api/plans";
import { CreatePlanFormSchema } from "@/utils/schemas/plan";
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

type PlanFormSchema = z.infer<typeof CreatePlanFormSchema>;

type DefaultPlanFunction = (plan_type: PlanFormSchema["plan_type"]) => PlanFormSchema;

export const DEFAULT_PLAN: DefaultPlanFunction = (plan_type) => ({
  plan_type,
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
  plan_type: PlanFormSchema["plan_type"];
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
  const previousPlans = createAsync(() => getPreviousPlans(), { deferStream: true });
  const recommendedPlans = createAsync(() => getRecommendedPlans(), { deferStream: true });
  const plan_type_id = createAsync(() => getPlanTypeId(props.plan_type), { deferStream: true });
  const createPlan = useAction(createNewPlan);
  const isCreating = useSubmission(createNewPlan);

  const [newPlan, setNewPlan] = createSignal<z.infer<typeof CreatePlanFormSchema>>(DEFAULT_PLAN(props.plan_type));
  const [trackClearPlan, clearPlanHistory] = createSignal(undefined, { equals: false });
  const planHistory = createMemo(() => {
    // track what should rerun the memo
    trackClearPlan();
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
    plan_type_id,
    createPlan,
    isCreating: isCreating,
    clearPlanHistory,
    planHistory,
  };
});

const Title = () => {
  const plan = usePlanProvider();
  if (!plan) return <Skeleton class="w-40 h-8" />;
  return <h1 class="text-3xl font-semibold w-full capitalize">Create {plan.newPlan().plan_type}</h1>;
};

export const isFormEmpty = (plan: PlanFormSchema) => {
  return JSON.stringify(plan) === JSON.stringify(DEFAULT_PLAN(plan.plan_type));
};

export const CreatePlan = (props: CreatePlanProviderProps) => {
  const [currentTab, setCurrentTab] = createSignal<TabValue>("general");
  let formRef: HTMLFormElement;

  return (
    <CreatePlanProvider plan_type={props.plan_type}>
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
