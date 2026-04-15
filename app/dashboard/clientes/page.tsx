"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Plus, Search, Mail, Phone, Building, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Cliente {
  id: string | number
  nome: string
  cpf: string
  conta: number
  isvip: boolean
  data: number // Ano
  empresa: string
  status?: "ativo" | "inativo"
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    cpf: "",
    conta: 0,
    isvip: false,
    data: new Date().getFullYear(),
    empresa: "",
  })
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.empresa?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.cpf?.toLowerCase().includes(busca.toLowerCase())
  )


  const fetchClientes = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const token = sessionStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
      const response = await fetch(`${API_URL}/client/get?page=${page}&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log("Response Clientes:", data)
        const clientesList = Array.isArray(data)
          ? data
          : (data.clients || data.content || data.data || data.items || data.clientes || data.results || (typeof data === 'object' && Object.values(data).find(Array.isArray)) || [])

        setClientes(clientesList.map((c: any) => ({
          ...c,
          status: "ativo" // Default UI-only status
        })))

        if (data.total !== undefined) setTotal(data.total)
        else if (data.totalElements !== undefined) setTotal(data.totalElements)
        else if (data.count !== undefined) setTotal(data.count)
        else setTotal(clientesList.length)
      } else if (response.status === 401) {
        sessionStorage.removeItem("token")
        sessionStorage.removeItem("user")
        router.push("/login")
      } else {
        const errText = await response.text().catch(() => "")
        setFetchError(`Erro ${response.status}: ${errText || "Falha ao buscar clientes"}`)
        console.error("Erro ao buscar clientes", response.status, errText)
      }
    } catch (error) {
      setFetchError("Erro de conexão com a API")
      console.error("Erro de conexão", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [page, limit])

  const handleAddCliente = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
      
      const method = editingCliente ? "PUT" : "POST"
      const url = editingCliente 
        ? `${API_URL}/client/update/${editingCliente.id}` 
        : `${API_URL}/client/add`

      // Ensure data is sent as defined in DTO
      const payload = {
        nome: novoCliente.nome,
        cpf: novoCliente.cpf,
        conta: novoCliente.conta,
        isvip: novoCliente.isvip,
        data: novoCliente.data,
        empresa: novoCliente.empresa
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
        throw new Error(`Erro ${response.status}: ${errText || "Falha ao salvar cliente"}`)
      }

      if (editingCliente) {
        setClientes(clientes.map(c => c.id === editingCliente.id ? { ...editingCliente, ...novoCliente } : c))
      } else {
        const criado = await response.json().catch(() => null)
        const novo: Cliente = criado ?? {
          id: String(Date.now()),
          ...novoCliente,
          status: "ativo",
        }
        setClientes([novo, ...clientes])
      }

      setNovoCliente({ nome: "", cpf: "", conta: 0, isvip: false, data: new Date().getFullYear(), empresa: "" })
      setEditingCliente(null)
      setDialogOpen(false)
      
      // Update data from server to ensure stats are in sync
      fetchClientes()
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar cliente", error)
      alert(`Erro ao salvar: ${error instanceof Error ? error.message : "Falha desconhecida"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setNovoCliente({
      nome: cliente.nome,
      cpf: cliente.cpf,
      conta: cliente.conta,
      isvip: cliente.isvip,
      data: cliente.data,
      empresa: cliente.empresa,
    })
    setDialogOpen(true)
  }

  const handleDeleteCliente = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return
    try {
      const token = sessionStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
      const response = await fetch(`${API_URL}/client/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!response.ok) {
        const errText = await response.text().catch(() => "")
        throw new Error(`Erro ${response.status}: ${errText || "Falha ao excluir cliente"}`)
      }
      setClientes(clientes.filter((c) => c.id !== id))
      fetchClientes()
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir cliente", error)
      alert(`Erro ao excluir: ${error instanceof Error ? error.message : "Falha desconhecida"}`)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingCliente(null)
            setNovoCliente({ nome: "", cpf: "", conta: 0, isvip: false, data: new Date().getFullYear(), empresa: "" })
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCliente(null)
              setNovoCliente({ nome: "", cpf: "", conta: 0, isvip: false, data: new Date().getFullYear(), empresa: "" })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCliente ? "Editar Cliente" : "Adicionar Cliente"}</DialogTitle>
              <DialogDescription>
                {editingCliente ? "Atualize as informações do cliente" : "Preencha as informações do novo cliente"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCliente}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nome">Nome</FieldLabel>
                  <Input
                    id="nome"
                    value={novoCliente.nome}
                    onChange={(e) =>
                      setNovoCliente({ ...novoCliente, nome: e.target.value })
                    }
                    placeholder="Nome completo"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                  <Input
                    id="cpf"
                    value={novoCliente.cpf}
                    onChange={(e) =>
                      setNovoCliente({ ...novoCliente, cpf: e.target.value })
                    }
                    placeholder="000.000.000-00"
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="conta">Conta</FieldLabel>
                    <Input
                      id="conta"
                      type="number"
                      value={novoCliente.conta}
                      onChange={(e) =>
                        setNovoCliente({ ...novoCliente, conta: parseInt(e.target.value) || 0 })
                      }
                      placeholder="Número da conta"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="data">Ano</FieldLabel>
                    <Input
                      id="data"
                      type="number"
                      value={novoCliente.data}
                      onChange={(e) =>
                        setNovoCliente({ ...novoCliente, data: parseInt(e.target.value) || new Date().getFullYear() })
                      }
                      placeholder="Ex: 2024"
                      required
                    />
                  </Field>
                </div>
                <Field>
                  <div className="flex items-center gap-2">
                    <input
                      id="isvip"
                      type="checkbox"
                      checked={novoCliente.isvip}
                      onChange={(e) =>
                        setNovoCliente({ ...novoCliente, isvip: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <FieldLabel htmlFor="isvip" className="mb-0">Cliente VIP?</FieldLabel>
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="empresa">Empresa</FieldLabel>
                  <Input
                    id="empresa"
                    value={novoCliente.empresa}
                    onChange={(e) =>
                      setNovoCliente({ ...novoCliente, empresa: e.target.value })
                    }
                    placeholder="Nome da empresa"
                    required
                  />
                </Field>
              </FieldGroup>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setEditingCliente(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">{editingCliente ? "Salvar Alterações" : "Adicionar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Clients Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      ) : fetchError ? (
        <div className="text-center py-12">
          <p className="text-destructive font-medium">{fetchError}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} className="border-border/50 bg-card/50">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(cliente.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{cliente.nome}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {cliente.empresa}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCliente(cliente)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteCliente(cliente.id)}
                    >
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span className="truncate">CPF: {cliente.cpf}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                  <span>Conta: {cliente.conta}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cliente.isvip
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {cliente.isvip ? "VIP" : "Regular"}
                  </span>
                  <span className="text-xs text-muted-foreground">Ano: {cliente.data}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {clientesFiltrados.length === 0 && !isLoading && !fetchError && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum cliente encontrado</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && clientes.length > 0 && (
        <div className="flex justify-between items-center py-2">
          <p className="text-sm text-muted-foreground">
            Página {page}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={clientes.length < limit || (total > 0 && page * limit >= total)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
