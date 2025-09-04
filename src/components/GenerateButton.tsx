import { Shuffle } from "lucide-react";

export const GenerateButton = ({
  generateMealPlan,
  disabled,
}: {
  generateMealPlan: () => void;
  disabled: boolean;
}) => {
  return (
    <button onClick={generateMealPlan} disabled={disabled}>
      <Shuffle />
    </button>
  );
};
