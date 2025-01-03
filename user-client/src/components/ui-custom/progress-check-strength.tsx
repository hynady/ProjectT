import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils.ts"

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number // Đảm bảo value là kiểu number
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, ...props }, ref) => {
  // Hàm để lấy màu sắc dựa trên giá trị
  const getBackgroundColor = (value: number) => {
    if (value <= 20) return 'bg-orange-500 dark:bg-orange-700'
    if (value <= 40) return 'bg-amber-400 dark:bg-amber-700'
    if (value <= 60) return 'bg-yellow-400 dark:bg-yellow-700'
    if (value <= 80) return 'bg-lime-400 dark:bg-lime-700'
    return 'bg-green-400 dark:bg-green-700'
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={`h-full flex-1 transition-all ${getBackgroundColor(value)}`}
        style={{
          width: `${value}%`, // Chiều dài của indicator theo giá trị
          transform: `translateX(-${100 - value}%)`, // Dịch chuyển theo giá trị
        }}
      />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
