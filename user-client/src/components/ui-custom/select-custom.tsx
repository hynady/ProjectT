// CustomSelect.tsx
import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils.ts";
import { ChevronDown } from "lucide-react";

interface CustomSelectProps {
  options: { value: string | number; label: string }[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
                                                     options,
                                                     value,
                                                     onChange,
                                                     placeholder,
                                                     className
                                                   }) => {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  const checkScroll = () => {
    if (selectRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = selectRef.current;
      setShowScrollUp(scrollTop > 0);
      setShowScrollDown(scrollTop + clientHeight < scrollHeight);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [options]);

  return (
    <div className="relative">
      {showScrollUp && (
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      )}
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={checkScroll}
        className={cn(
          "flex h-9 w-[110px] items-center justify-between",
          "rounded-md border border-input bg-background px-3 py-2",
          "text-sm text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "select-none appearance-none",
          "scrollbar-none",
          className
        )}
      >
        {placeholder && (
          <option value="" disabled className="text-muted-foreground bg-background">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-foreground bg-background py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            {option.label}
          </option>
        ))}
      </select>
      {showScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      )}
      <ChevronDown
        className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none"
      />
    </div>
  );
};

export default CustomSelect;