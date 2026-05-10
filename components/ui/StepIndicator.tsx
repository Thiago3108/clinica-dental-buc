import { Check } from "lucide-react";

type StepIndicatorProps = {
  steps: string[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={index} className="flex-1 flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    isCompleted
                      ? "bg-primary text-white"
                      : isActive
                      ? "bg-primary text-white ring-4 ring-primary/20"
                      : "bg-bg-tertiary text-text-muted"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span
                  className={`mt-1.5 text-[10px] sm:text-xs font-medium text-center hidden sm:block ${
                    isActive ? "text-primary" : isCompleted ? "text-text-primary" : "text-text-muted"
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 ${isCompleted ? "bg-primary" : "bg-bg-tertiary"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
