import { Shuffle } from "lucide-react";

export default function GenerateButton({
  generateMealPlan,
  disabled,
}: {
  generateMealPlan: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={generateMealPlan}
      disabled={disabled}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <Shuffle className="w-4 h-4" />
      Generate Plan
    </button>
  );
}
