import React, { PropsWithChildren, ReactNode } from 'react';
import { cn } from "@/commons/lib/utils/utils";

interface ButtonProps {
  active?: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLSpanElement>) => void;
}

export const Button = ({ active, onMouseDown, children }: PropsWithChildren<ButtonProps>) => (
  <span
    className={cn(
      "cursor-pointer rounded p-1 hover:bg-muted",
      active && "bg-muted"
    )}
    onMouseDown={onMouseDown}
  >
    {children}
  </span>
);

export const Icon = ({ children }: { children: ReactNode }) => {
  return <span className="material-icons text-sm">{children}</span>;
};

export const Toolbar = ({ children }: PropsWithChildren) => {
  return (
    <div className="border-b p-1 flex flex-wrap gap-1 items-center">
      {children}
    </div>
  );
};
