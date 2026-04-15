"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { StatCard } from "@/components/dashboard/stat-card"
import { DataTable } from "@/components/dashboard/data-table"
import { LineChart } from "@/components/dashboard/line-chart"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { NewsFeed } from "@/components/dashboard/news-feed"
import { Users, UserCog, Database, Heart, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>({
    totalClientes: 0,
    totalFuncionarios: 0,
    totalProdutos: 0,
    patrimonioEstoque: 0,
    taxaVip: 0,
    latestClients: [],
    activities: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem("token")
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const clientesData = stats?.latestClients?.map((c: any) => ({
    label: c.nome,
    value: c.empresa
  })) || []

  const chartData = [
    { name: "Seg", line1: 40, line2: 24 },
    { name: "Ter", line1: 30, line2: 13 },
    { name: "Qua", line1: 45, line2: 38 },
    { name: "Qui", line1: 50, line2: 42 },
    { name: "Sex", line1: 49, line2: 48 },
  ]

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo, {user?.name?.split(" ")[0] || "Usuário"}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Visão geral e análises do seu sistema em tempo real
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total de Clientes"
            value={stats?.totalClientes?.toString() || "0"}
            subtitle="Clientes cadastrados"
            icon={Users}
            valueColor="text-primary"
          />
          <StatCard
            title="Equipe"
            value={stats?.totalFuncionarios?.toString() || "0"}
            subtitle="Colaboradores ativos"
            icon={UserCog}
            valueColor="text-accent"
          />
          <StatCard
            title="Patrimônio Estoque"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.patrimonioEstoque || 0)}
            subtitle={`${stats?.totalProdutos || 0} produtos únicos`}
            icon={Database}
            valueColor="text-primary"
            valueClassName="text-2xl"
          />
          <StatCard
            title="Taxa de VIPs"
            value={`${stats?.taxaVip?.toFixed(1) || "0"}%`}
            subtitle="Base de clientes premium"
            icon={TrendingUp}
            valueColor="text-accent"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <DataTable title="Últimos Clientes" data={clientesData} />
          </div>

          {/* Center Column */}
          <div className="lg:col-span-1 space-y-6">
            <LineChart
              title="Atividade Semanal"
              data={chartData}
              line1Label="Operações"
              line2Label="Metas"
            />
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">Métricas Adicionais</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Produtos no Catálogo</span>
                  <span className="font-bold">{stats?.totalProdutos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Média IsVip</span>
                  <span className="font-bold text-accent">{stats?.taxaVip?.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <NewsFeed title="Atividades Recentes" items={stats?.activities || []} />
            <ProgressRing
              title="Engajamento"
              value={stats?.taxaVip || 75}
              label="Taxa de Conversão"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
