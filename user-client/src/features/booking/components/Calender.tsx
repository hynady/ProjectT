import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/commons/components/popover";
import { Calendar } from "@/commons/components/calendar";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/commons/components/button";
import { vi } from "date-fns/locale";
import { useState } from "react";

export const CalendarNormal = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="group w-[200px] justify-start gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className={`${isOpen ? 'w-32' : 'w-0 group-hover:w-32'} overflow-hidden transition-all duration-300 ease-in-out`}>
                        Nhấn để xem lịch
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar 
                    mode="single" 
                    className="rounded-md border"
                    locale={vi}
                    formatters={{
                        formatCaption: (date: Date) => date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
                    }}
                />
            </PopoverContent>
        </Popover>
  );
};
