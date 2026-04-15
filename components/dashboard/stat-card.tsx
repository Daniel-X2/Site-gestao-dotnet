import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: "up" | "down"
  trendValue?: string
  className?: string
  valueColor?: string
  valueClassName?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  className,
  valueColor = "text-primary",
  valueClassName,
}: StatCardProps) {
  return (
    <Card className={cn("bg-card border-border overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground font-medium truncate">{title}</p>
            {Icon && (
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <h2 className={cn("text-3xl font-bold tracking-tight", valueColor, valueClassName)}>
              {value}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
