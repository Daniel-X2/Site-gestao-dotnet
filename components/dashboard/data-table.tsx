import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DataTableProps {
  title: string
  data: { label: string; value: number }[]
}

export function DataTable({ title, data }: DataTableProps) {
  const numericValues = data.map((item) => Number(item.value)).filter((v) => !isNaN(v))
  const maxValue = numericValues.length > 0 ? Math.max(...numericValues) : 1

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {data.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Nenhum registro encontrado</p>
            </div>
          ) : (
            data.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(Number(item.value) / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-12 text-right">
                    {item.value}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
