import React from 'react';
import {Input} from "@/commons/components/input.tsx";
import {Search} from "lucide-react";
import {cn} from "@/commons/lib/utils/utils";

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement>;
  query: string;
  isOpen: boolean;
  onQueryChange: (value: string) => void;
  onFocus: () => void;
  onKeyUp: (e: React.KeyboardEvent) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
                                                          inputRef,
                                                          query,
                                                          isOpen,
                                                          onQueryChange,
                                                          onFocus,
                                                          onKeyUp,
                                                        }) => {
  return (
    <div className={cn("relative",
      isOpen &&
      "z-50 absolute left-0 right-0 top-4 mx-auto w-[95vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-3xl")}>
      <Input
        ref={inputRef}
        placeholder="Tìm kiếm sự kiện..."
        className="pl-10 pr-4 h-11 rounded-full border border-input bg-background"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={onFocus}
        onKeyUp={onKeyUp}
      />
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
};