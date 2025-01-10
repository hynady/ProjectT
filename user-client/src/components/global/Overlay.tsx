import { cn } from "@/lib/utils";
import {useState} from "react";

interface OverlayProps {
  isVisible: boolean;
  onClick: () => void;
}

export function Overlay({ isVisible, onClick }: OverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 h-screen w-screen",
        "backdrop-blur-sm bg-black/10",
        "animate-fade animate-duration-200",
        "supports-[backdrop-filter]:bg-black/60" // Fallback cho trình duyệt không hỗ trợ backdrop-filter
      )}
      onClick={onClick}
    />
  );
}

export function useOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, open, close };
}