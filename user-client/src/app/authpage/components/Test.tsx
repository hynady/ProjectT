import {Command, CommandInput, CommandList} from "@/components/ui/command.tsx";

export function CardWithForm() {
  return (
    <Command >
      <CommandInput/>
      <CommandList>Place content for the popover here.</CommandList>
    </Command>
  )
}
