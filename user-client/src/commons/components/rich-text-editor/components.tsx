import React, { PropsWithChildren } from 'react';
import { cn } from "@/commons/lib/utils/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/commons/components/tooltip";

interface ButtonProps {
  active?: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLButtonElement>) => void;
  tooltip?: string;
}

export const Button = ({ active, onMouseDown, children, tooltip }: PropsWithChildren<ButtonProps>) => {
  const buttonElement = (
    <button
      type="button"
      className={cn(
        "cursor-pointer rounded p-1 hover:bg-muted inline-flex items-center justify-center",
        active && "bg-muted"
      )}
      onMouseDown={onMouseDown}
    >
      {children}
    </button>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonElement}
          </TooltipTrigger>
          <TooltipContent sideOffset={5} side="bottom">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonElement;
};

export const Toolbar = ({ children }: PropsWithChildren) => {
  return (
    <div className="border-b p-1 flex flex-wrap gap-1 items-center">
      {children}
    </div>
  );
};
