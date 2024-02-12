import CreateConcertForm from "@/components/forms/CreateConcert";

export default function PlanCreateEventPage() {
  return (
    <div class="flex flex-col py-10">
      <div class="px-4 lg:px-0 w-full">
        <CreateConcertForm />
      </div>
    </div>
  );
}
