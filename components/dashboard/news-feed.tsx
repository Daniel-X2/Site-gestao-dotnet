import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface NewsItem {
  source: string
  title: string
  time: string
}

interface NewsFeedProps {
  title: string
  items: NewsItem[]
}

export function NewsFeed({ title, items }: NewsFeedProps) {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-primary font-medium">{item.source}</span>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
              <p className="text-sm text-foreground line-clamp-2">{item.title}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
