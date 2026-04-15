"use client"

import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  title: string
  breadcrumb?: string
}

export function Header({ title, breadcrumb }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 lg:p-6 border-b border-border">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <span>Dashboard</span>
          {breadcrumb && (
            <>
              <span>{">"}</span>
              <span className="text-foreground">{breadcrumb}</span>
            </>
          )}
        </div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-10 w-64 bg-input border-border"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
        </Button>
        <Avatar>
          <AvatarImage src="/avatar.jpg" />
          <AvatarFallback className="bg-primary text-primary-foreground">JS</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
