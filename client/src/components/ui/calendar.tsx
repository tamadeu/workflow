import * as React from "react"

import { cn } from "@/lib/utils"

const Calendar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    mode?: "single" | "multiple" | "range"
    selected?: Date | Date[] | undefined
    onSelect?: (date: Date | Date[] | undefined) => void
  }
>(({ className, mode = "single", selected, onSelect, ...props }, ref) => {
  const [currentDate, setCurrentDate] = React.useState(new Date())

  const handleDateClick = (date: Date) => {
    if (onSelect) {
      onSelect(date)
    }
  }

  return (
    <div
      ref={ref}
      className={cn("p-3", className)}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="p-2 font-medium text-gray-500">
            {day}
          </div>
        ))}
        {/* Simplified calendar grid - you can expand this with proper date logic */}
        {Array.from({ length: 35 }, (_, i) => (
          <button
            key={i}
            className="p-2 hover:bg-gray-100 rounded"
            onClick={() => handleDateClick(new Date())}
          >
            {i + 1 <= 31 ? i + 1 : ''}
          </button>
        ))}
      </div>
    </div>
  )
})
Calendar.displayName = "Calendar"

export { Calendar }
