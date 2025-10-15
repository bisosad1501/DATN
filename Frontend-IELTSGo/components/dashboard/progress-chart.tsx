"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"

interface DataPoint {
  date: string
  value: number
}

interface ProgressChartProps {
  title: string
  data: DataPoint[]
  color?: string
  valueLabel?: string
}

export function ProgressChart({ title, data, color = "#ED372A", valueLabel = "Value" }: ProgressChartProps) {
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 100
    const values = data.map((d) => d.value).filter(v => typeof v === 'number' && !isNaN(v))
    if (values.length === 0) return 100
    return Math.max(...values, 1)
  }, [data])

  const chartHeight = 200
  
  // Ensure data is valid
  const validData = data?.filter(d => d && typeof d.value === 'number' && !isNaN(d.value)) || []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: chartHeight }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground pr-2">
            <span>{maxValue.toFixed(0)}</span>
            <span>{Math.round(maxValue / 2)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full flex items-end justify-between gap-1">
            {validData.map((point, index) => {
              const height = (point.value / maxValue) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer relative"
                    style={{
                      height: `${height}%`,
                      backgroundColor: color,
                      minHeight: point.value > 0 ? "4px" : "0",
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {point.value} {valueLabel}
                      <div className="text-[10px] text-gray-300">
                        {new Date(point.date).toLocaleDateString("vi-VN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="ml-8 mt-2 flex justify-between text-xs text-muted-foreground">
            {validData.length > 0 && (
              <>
                <span>
                  {new Date(validData[0].date).toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>
                  {new Date(validData[validData.length - 1].date).toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
