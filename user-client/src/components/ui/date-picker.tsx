import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarCustom } from "@/components/ui/calendar-custom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CustomSelect from "@/components/ui/select-custom.tsx";

interface DatePickerProps {
  startYear?: number;
  endYear?: number;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function DatePicker({
                             startYear = getYear(new Date()) - 100,
                             endYear = getYear(new Date()) - 16,
                             selectedDate,
                             onDateChange,
                           }: DatePickerProps) {
  const [date, setDate] = React.useState<Date>(selectedDate || new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const handleMonthChange = (value: string | number) => {
    const newDate = setMonth(date, months.indexOf(value as string));
    setDate(newDate);
    onDateChange(newDate);
  }

  const handleYearChange = (value: string | number) => {
    const newDate = setYear(date, parseInt(value as string));
    setDate(newDate);
    onDateChange(newDate);
  }

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      onDateChange(selectedDate);
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[250px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="flex items-center justify-between space-x-2 p-2 border-b border-border">
          <CustomSelect
            value={months[getMonth(date)]}
            options={months.map((month) => ({ value: month, label: month }))}
            onChange={handleMonthChange}
            className="flex-1"
          />
          <CustomSelect
            value={getYear(date).toString()}
            options={years.map((year) => ({
              value: year.toString(),
              label: year.toString()
            }))}
            onChange={handleYearChange}
            className="flex-1"
          />
        </div>
        <CalendarCustom
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          month={date}
          onMonthChange={setDate}
        />
      </PopoverContent>
    </Popover>
  );
}