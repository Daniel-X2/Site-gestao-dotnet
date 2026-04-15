"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProgressRingProps {
  title: string
  value: number
  label?: string
}

export function ProgressRing({ title, value, label }: ProgressRingProps) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-4">
        <div className="relative">
          <svg width="120" height="120" className="transform -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="var(--secondary)"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="var(--primary)"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{value}%</span>
          </div>
        </div>
        {label && (
          <p className="text-xs text-muted-foreground mt-3 text-center">{label}</p>
        )}
      </CardContent>
    </Card>
  )
}
