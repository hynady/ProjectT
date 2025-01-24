import { cn } from "@/commons/lib/ultils/utils.ts"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary dark:bg-slate-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
