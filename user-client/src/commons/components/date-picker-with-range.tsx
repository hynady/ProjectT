"use client";

import { format, Locale } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/commons/lib/utils/utils";
import { Button } from "@/commons/components/button";
import { Calendar } from "@/commons/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/commons/components/popover";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  align?: "center" | "start" | "end";
  locale?: Locale;
  placeholder?: string;
  calendarDays?: number;
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
  align = "center",
  locale = vi,
  placeholder = "Chọn ngày",
  calendarDays = 2
}: DatePickerWithRangeProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "P", { locale })} -{" "}
                  {format(date.to, "P", { locale })}
                </>
              ) : (
                format(date.from, "P", { locale })
              )
            ) : (
              <span>{placeholder}</span>
            )}
            {date?.from && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onDateChange(undefined);
                }}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Xóa ngày</span>
              </Button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={calendarDays}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
