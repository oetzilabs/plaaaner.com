import { Button } from "@/components/ui/button";

export const Dangerzone = () => {

  return (
    <div class="flex flex-col items-start gap-8 w-full">
      <div class="flex flex-col items-start gap-2 w-full">
        <span class="text-lg font-semibold">Dangerzone</span>
        <span class="text-sm text-muted-foreground">Please be causious what you click on!</span>
      </div>
      <div class="gap-4 w-full flex flex-col">
        <span class="text-sm font-bold">This area is still in development</span>
      </div>
    </div>
  );
};
