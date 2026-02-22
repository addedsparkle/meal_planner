import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useGenerateMealPlan } from "../../hooks/useMealPlans";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine((d) => d.endDate >= d.startDate, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

type FormData = z.infer<typeof schema>;

interface MealPlanGeneratorProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function MealPlanGenerator({ onSuccess, onCancel }: MealPlanGeneratorProps) {
  const generate = useGenerateMealPlan();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      await generate.mutateAsync(data);
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
          label="End Date"
          type="date"
          {...register("endDate")}
          error={errors.endDate?.message}
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
