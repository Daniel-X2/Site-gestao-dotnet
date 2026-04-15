"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Plus, Search, Package, Tag, Layers, Database, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Produto {
  id: string | number
  nome: string
  codigo: number
  quantidade: number
  valorRevenda: number
  lote: number
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    codigo: 0,
    quantidade: 0,
    valor_revenda: 0,
    lote: 0,
  })
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const router = useRouter()

  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      String(produto.codigo).includes(busca)
  )


  const fetchProdutos = async () => {
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
      const response = await fetch(`${API_URL}/product/get`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Response Produtos:", data)
        const produtosList = Array.isArray(data)
          ? data
          : (data.product || data.content || data.data || [])
        
        setProdutos(produtosList.map((p: any) => ({
          ...p,
          valorRevenda: p.valorRevenda ?? p.valor_revenda ?? 0
        })))
      }
    } catch (error) {
      console.error("Erro ao buscar produtos", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  const handleAddProduto = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

      const method = editingProduto ? "PUT" : "POST"
      const url = editingProduto
        ? `${API_URL}/product/update/${editingProduto.id}`
        : `${API_URL}/product/add`

      // Mapeia para camelCase (valorRevenda) conforme DTO da API
      const payload = {
        nome: novoProduto.nome,
        codigo: novoProduto.codigo,
        quantidade: novoProduto.quantidade,
        valorRevenda: novoProduto.valor_revenda,
        lote: novoProduto.lote
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => "")
        throw new Error(`Erro ${response.status}: ${errText || "Falha ao salvar produto"}`)
      }

      if (editingProduto) {
        setProdutos(produtos.map(p =>
          p.id === editingProduto.id ? { ...editingProduto, ...novoProduto, valorRevenda: novoProduto.valor_revenda } : p
        ))
      } else {
        const criado = await response.json().catch(() => null)
        const novo: Produto = criado ?? { id: String(Date.now()), ...novoProduto, valorRevenda: novoProduto.valor_revenda }
        setProdutos([novo, ...produtos])
      }

      setNovoProduto({ nome: "", codigo: 0, quantidade: 0, valor_revenda: 0, lote: 0 })
      setEditingProduto(null)
      setDialogOpen(false)
      
      // Refresh data
      fetchProdutos()
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar produto", error)
      alert(`Erro ao salvar: ${error instanceof Error ? error.message : "Falha desconhecida"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProduto = (produto: Produto) => {
    setEditingProduto(produto)
    setNovoProduto({
      nome: produto.nome,
      codigo: produto.codigo,
      quantidade: produto.quantidade,
      valor_revenda: produto.valor_revenda,
      lote: produto.lote,
    })
    setDialogOpen(true)
  }

  const handleDeleteProduto = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return
    try {
      const token = sessionStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
      const response = await fetch(`${API_URL}/product/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!response.ok) {
        const errText = await response.text().catch(() => "")
        throw new Error(`Erro ${response.status}: ${errText || "Falha ao excluir produto"}`)
      }
      setProdutos(produtos.filter((p) => p.id !== id))
      fetchProdutos()
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir produto", error)
      alert(`Erro ao excluir: ${error instanceof Error ? error.message : "Falha desconhecida"}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu estoque de produtos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingProduto(null)
            setNovoProduto({ nome: "", codigo: 0, quantidade: 0, valor_revenda: 0, lote: 0 })
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingProduto(null)
              setNovoProduto({ nome: "", codigo: 0, quantidade: 0, valor_revenda: 0, lote: 0 })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduto ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
              <DialogDescription>
                {editingProduto ? "Atualize as informações do produto." : "Preencha as informações do novo produto conforme o banco de dados."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduto}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nome">Nome do Produto</FieldLabel>
                  <Input
                    id="nome"
                    value={novoProduto.nome}
                    onChange={(e) =>
                      setNovoProduto({ ...novoProduto, nome: e.target.value })
                    }
                    placeholder="Ex: Teclado Mecânico"
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="codigo">Código</FieldLabel>
                    <Input
                      id="codigo"
                      type="number"
                      value={novoProduto.codigo}
                      onChange={(e) =>
                        setNovoProduto({ ...novoProduto, codigo: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0001"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lote">Lote</FieldLabel>
                    <Input
                      id="lote"
                      type="number"
                      value={novoProduto.lote}
                      onChange={(e) =>
                        setNovoProduto({ ...novoProduto, lote: parseInt(e.target.value) || 0 })
                      }
                      placeholder="123"
                      required
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="quantidade">Quantidade</FieldLabel>
                    <Input
                      id="quantidade"
                      type="number"
                      value={novoProduto.quantidade}
                      onChange={(e) =>
                        setNovoProduto({ ...novoProduto, quantidade: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="valor">Valor de Revenda</FieldLabel>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={novoProduto.valor_revenda}
                      onChange={(e) =>
                        setNovoProduto({ ...novoProduto, valor_revenda: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0.00"
                      required
                    />
                  </Field>
                </div>
              </FieldGroup>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setEditingProduto(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">{editingProduto ? "Salvar Alterações" : "Adicionar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos pelo nome ou código..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table Card */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Estoque</CardTitle>
          <CardDescription>{produtos.length} produtos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Produto
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Código
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    Lote
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Qtd
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Valor (R$)
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando produtos...
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((produto) => (
                    <tr key={produto.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10 text-primary">
                            <Package className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-sm">{produto.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {produto.codigo}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {produto.lote}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${produto.quantidade < 10 ? 'text-destructive' : 'text-foreground'}`}>
                          {produto.quantidade}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.valorRevenda)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditProduto(produto)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteProduto(produto.id)}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {produtosFiltrados.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum produto encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
