import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useGenerateMealPlan } from "../../hooks/useMealPlans";

function nextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilMonday = (1 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().split("T")[0]!;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]!;
}

function defaultName(startDate: string): string {
  const d = new Date(startDate + "T00:00:00");
  return `Week of ${d.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  numDays: z.coerce.number().int().min(1, "At least 1 day").max(28, "Maximum 28 days"),
});

type FormData = z.infer<typeof schema>;

interface MealPlanGeneratorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MealPlanGenerator({ onSuccess, onCancel }: MealPlanGeneratorProps) {
  const generate = useGenerateMealPlan();
  const start = nextMonday();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultName(start),
      startDate: start,
      numDays: 7,
    },
  });

  async function onSubmit(data: FormData) {
    const endDate = addDays(data.startDate, data.numDays - 1);
    try {
      await generate.mutateAsync({ name: data.name, startDate: data.startDate, endDate });
      onSuccess();
    } catch {
      // error shown via generate.error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        Generates a plan with dinner every day, lunch daily if available, and breakfast
        cycling every 3 days. Recipes are distributed by protein to avoid repetition.
      </p>

      <Input
        label="Plan Name"
        {...register("name")}
        error={errors.name?.message}
        placeholder="e.g. Week of 3 March"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
          {...register("startDate")}
          error={errors.startDate?.message}
        />
        <Input
          label="Number of Days"
          type="number"
          min={1}
          max={28}
          {...register("numDays")}
          error={errors.numDays?.message}
        />
      </div>

      {generate.error && <ErrorMessage error={generate.error} />}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={generate.isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={generate.isPending}>
          Generate Plan
        </Button>
      </div>
    </form>
  );
}
