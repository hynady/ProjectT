import { Search } from "lucide-react";

export function LoadingDots() {
  return (
    <span className="inline-flex">
      <span className="animate-bounce animate-delay-[20ms] animate-ease-in-out text-primary"> <Search /></span>
      <span className="animate-bounce animate-delay-[40ms] animate-ease-in-out text-primary"> <Search /></span>
      <span className="animate-bounce animate-delay-[60ms] animate-ease-in-out text-primary"> <Search /></span>
      <span className="animate-bounce animate-delay-[80ms] animate-ease-in-out text-primary"> <Search /></span>
    </span>
  );
}