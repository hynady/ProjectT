import { Progress } from "@/commons/components/progress.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/commons/components/tooltip.tsx";

interface Step {
  title: string;
  completed: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export const ProgressSteps = ({
                                steps,
                                currentStep,
                                onStepClick
                              }: ProgressStepsProps) => {
  const calculateProgress = () => {
    if (currentStep === 1) return 0;
    return ((currentStep - 1) / (steps.length - 1)) * 100;
  };

  return (
    <div className="relative">
      {/* Progress Bar */}
      <Progress value={calculateProgress()} className="h-4" />

      {/* Steps */}
      <div className="absolute top-0 left-0 w-full">
        <div className="relative h-2">
          {steps.map((stepItem, index) => {
            const isClickable = index + 1 < currentStep || stepItem.completed;
            const isActive = currentStep === index + 1;
            const isPassed = currentStep > index + 1;
            const position = index === 0
              ? '0%'
              : index === steps.length - 1
                ? '100%'
                : `${(index / (steps.length - 1)) * 100}%`;

            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: position,
                  transform: 'translate(-50%, -25%)'
                }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onStepClick(index + 1)}
                        disabled={!isClickable && index + 1 > currentStep}
                        className={`
                          relative group
                          ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                        `}
                      >
                        {/* Step Number Circle */}
                        <div className={`
                          w-8 h-8 rounded-full 
                          flex items-center justify-center
                          text-sm font-medium
                          transition-all duration-3 00
                          border-2
                          ${isPassed || isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/25 bg-background text-muted-foreground'
                        }
                          ${isClickable && !isActive
                          ? 'hover:border-primary hover:text-primary'
                          : ''
                        }
                        `}>
                          {index + 1}
                        </div>

                        {/* Step Title */}
                        <div className={`
                          absolute top-full pt-2
                          left-1/2 -translate-x-1/2
                          whitespace-nowrap
                          text-sm text-center
                          transition-colors duration-300
                          ${isActive ? 'text-primary font-medium' : ''}
                          ${isPassed ? 'text-primary' : 'text-muted-foreground'}
                          ${isClickable && !isActive ? 'group-hover:text-primary' : ''}
                        `}>
                          {stepItem.title}
                        </div>
                      </button>
                    </TooltipTrigger>
                    {isClickable && !isActive && (
                      <TooltipContent>
                        <p>{isPassed ? 'Quay lại bước này' : 'Đi đến bước này'}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};