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
import { Plus, Search, Mail, Briefcase, MoreHorizontal, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Funcionario {
  id: string | number
  nome: string
  cpf: string
  senha?: string
  isadmin: boolean
  quantidadeAtestado: number
  nascimento: number // Ano de nascimento
  data: number // Ano de admissão
  status?: "ativo" | "ferias" | "afastado"
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const [busca, setBusca] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    cpf: "",
    senha: "",
    isadmin: false,
    quantidadeAtestado: 0,
    nascimento: 1990,
    data: new Date().getFullYear(),
  })
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null)

  const funcionariosFiltrados = funcionarios.filter(
    (funcionario) =>
      funcionario.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      funcionario.cpf?.toLowerCase().includes(busca.toLowerCase())
  )


    const fetchFuncionarios = async () => {
      setIsLoading(true)
      setFetchError(null)
      try {
        const token = sessionStorage.getItem("token")
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
        const response = await fetch(`${API_URL}/funcionario/get?page=${page}&limit=${limit}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log("Response Funcionarios:", data)
          let funcionariosList = Array.isArray(data)
            ? data
            : (data.funcionarios || data.content || data.data || data.items || data.results || (typeof data === 'object' && Object.values(data).find(Array.isArray)) || [])

          if (user && user.role !== "Admin" && user.role !== "User") {
            funcionariosList = funcionariosList.filter((f: any) =>
              (f.cpf && f.cpf === user.cpf) ||
              (f.id && String(f.id) === String(user.id)) ||
              (f.nome && f.nome === user.name)
            )
          }

          setFuncionarios(funcionariosList.map((f: any) => ({
            ...f,
            // Ensure fields match frontend naming if backend returns different case
            quantidadeAtestado: f.quantidadeAtestado ?? f.quantidade_atestado ?? 0,
            status: f.status ?? "ativo",
            data: f.data ?? new Date().toISOString().split("T")[0]
          })))

          if (data.total !== undefined) setTotal(data.total)
          else if (data.totalElements !== undefined) setTotal(data.totalElements)
          else if (data.count !== undefined) setTotal(data.count)
          else setTotal(funcionariosList.length)
        } else if (response.status === 401) {
          sessionStorage.removeItem("token")
          sessionStorage.removeItem("user")
          router.push("/login")
        } else {
          const errText = await response.text().catch(() => "")
          setFetchError(`Erro ${response.status}: ${errText || "Falha ao buscar funcionários"}`)
          console.error("Erro ao buscar funcionários", response.status, errText)
        }
      } catch (error) {
        setFetchError("Erro de conexão com a API")
        console.error("Erro de conexão", error)
      } finally {
        setIsLoading(false)
      }
    }

    useEffect(() => {
      if (user) {
        fetchFuncionarios()
      }
    }, [user, page, limit])

  const handleAddFuncionario = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const token = sessionStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

      const method = editingFuncionario ? "PUT" : "POST"
      const url = editingFuncionario
        ? `${API_URL}/funcionario/update/${editingFuncionario.id}`
        : `${API_URL}/funcionario/add`

      // Mapeia os campos para o formato esperado pelo DTO da API (camelCase)
      const payload = {
        nome: novoFuncionario.nome,
        cpf: novoFuncionario.cpf,
        senha: novoFuncionario.senha,
        isadmin: novoFuncionario.isadmin,
        quantidadeAtestado: novoFuncionario.quantidadeAtestado,
        nascimento: novoFuncionario.nascimento,
        data: novoFuncionario.data,
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
        throw new Error(`Erro ${response.status}: ${errText || "Falha ao salvar funcionário"}`)
      }

      // Atualiza a lista local com os dados retornados pela API (ou mesclagem local)
      if (editingFuncionario) {
        setFuncionarios(funcionarios.map(f =>
          f.id === editingFuncionario.id ? { ...editingFuncionario, ...novoFuncionario } : f
        ))
      } else {
        const criado = await response.json().catch(() => null)
        const novo: Funcionario = criado ?? {
          id: String(Date.now()),
          ...novoFuncionario,
          status: "ativo",
        }
        setFuncionarios([novo, ...funcionarios])
      }

      setNovoFuncionario({
        nome: "",
        cpf: "",
        senha: "",
        isadmin: false,
        quantidadeAtestado: 0,
        nascimento: 1990,
        data: new Date().getFullYear(),
      })
      setEditingFuncionario(null)
      setDialogOpen(false)
      
      // Update data from server
      fetchFuncionarios()
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar funcionário", error)
      alert(`Erro ao salvar: ${error instanceof Error ? error.message : "Falha desconhecida"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditFuncionario = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario)
    setNovoFuncionario({
      nome: funcionario.nome,
      cpf: funcionario.cpf,
      senha: funcionario.senha || "",
      isadmin: funcionario.isadmin,
      quantidadeAtestado: funcionario.quantidadeAtestado,
      nascimento: funcionario.nascimento,
      data: funcionario.data as number,
    })
    setDialogOpen(true)
  }

  const handleDeleteFuncionario = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este funcionário?")) return
    try {
      const token = sessionStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
      const response = await fetch(`${API_URL}/Funcionario/delete/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!response.ok) {
        const errText = await response.text().catch(() => "")
        throw new Error(`Erro ${response.status}: ${errText || "Falha ao remover funcionário"}`)
      }
      setFuncionarios(funcionarios.filter((f) => f.id !== id))
      fetchFuncionarios()
      router.refresh()
    } catch (error) {
      console.error("Erro ao remover funcionário", error)
      alert(`Erro ao remover: ${error instanceof Error ? error.message : "Falha desconhecida"}`)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusStyle = (status: Funcionario["status"]) => {
    switch (status) {
      case "ativo":
        return "bg-primary/10 text-primary"
      case "ferias":
        return "bg-chart-4/20 text-chart-4"
      case "afastado":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: Funcionario["status"]) => {
    switch (status) {
      case "ativo":
        return "Ativo"
      case "ferias":
        return "Férias"
      case "afastado":
        return "Afastado"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground">Gerencie sua equipe</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setEditingFuncionario(null)
            setNovoFuncionario({
              nome: "",
              cpf: "",
              senha: "",
              isadmin: false,
              quantidadeAtestado: 0,
              nascimento: 1990,
              data: new Date().toISOString().split("T")[0],
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingFuncionario(null)
              setNovoFuncionario({
                nome: "",
                cpf: "",
                senha: "",
                isadmin: false,
                quantidadeAtestado: 0,
                nascimento: 1990,
                data: new Date().getFullYear(),
              })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFuncionario ? "Editar Funcionário" : "Adicionar Funcionário"}</DialogTitle>
              <DialogDescription>
                {editingFuncionario ? "Atualize as informações do funcionário" : "Preencha as informações do novo funcionário"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddFuncionario}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="nome">Nome</FieldLabel>
                  <Input
                    id="nome"
                    value={novoFuncionario.nome}
                    onChange={(e) =>
                      setNovoFuncionario({ ...novoFuncionario, nome: e.target.value })
                    }
                    placeholder="Nome completo"
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                    <Input
                      id="cpf"
                      value={novoFuncionario.cpf}
                      onChange={(e) =>
                        setNovoFuncionario({ ...novoFuncionario, cpf: e.target.value })
                      }
                      placeholder="000.000.000-00"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="senha">Senha</FieldLabel>
                    <Input
                      id="senha"
                      type="password"
                      value={novoFuncionario.senha}
                      onChange={(e) =>
                        setNovoFuncionario({ ...novoFuncionario, senha: e.target.value })
                      }
                      placeholder="••••••••"
                      required
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="nascimento">Ano Nascimento</FieldLabel>
                    <Input
                      id="nascimento"
                      type="number"
                      value={novoFuncionario.nascimento}
                      onChange={(e) =>
                        setNovoFuncionario({ ...novoFuncionario, nascimento: parseInt(e.target.value) || 1990 })
                      }
                      placeholder="Ex: 1990"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="data">Ano Admissão</FieldLabel>
                    <Input
                      id="data"
                      type="number"
                      value={novoFuncionario.data}
                      onChange={(e) =>
                        setNovoFuncionario({ ...novoFuncionario, data: parseInt(e.target.value) || new Date().getFullYear() })
                      }
                      placeholder="Ex: 2024"
                      required
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Field>
                    <FieldLabel htmlFor="atestados">Atestados (qtd)</FieldLabel>
                    <Input
                      id="atestados"
                      type="number"
                      value={novoFuncionario.quantidadeAtestado}
                      onChange={(e) =>
                        setNovoFuncionario({ ...novoFuncionario, quantidadeAtestado: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      required
                    />
                  </Field>
                </div>
                <Field>
                  <div className="flex items-center gap-2">
                    <input
                      id="isadmin"
                      type="checkbox"
                      checked={novoFuncionario.isadmin}
                      onChange={(e) =>
                        setNovoFuncionario({ ...novoFuncionario, isadmin: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <FieldLabel htmlFor="isadmin" className="mb-0">Administrador?</FieldLabel>
                  </div>
                </Field>
              </FieldGroup>
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setEditingFuncionario(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">{editingFuncionario ? "Salvar Alterações" : "Adicionar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar funcionários..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table Card */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
          <CardDescription>{funcionarios.length} funcionários cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Funcionário
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    CPF
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Admissão
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Admin
                  </th>
                  <th className="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Carregando funcionários...
                    </td>
                  </tr>
                ) : (
                  funcionariosFiltrados.map((funcionario) => (
                    <tr key={funcionario.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(funcionario.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {funcionario.nome}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              CPF: {funcionario.cpf}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="text-sm text-foreground">
                          {funcionario.cpf}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {funcionario.data}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${funcionario.isadmin
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {funcionario.isadmin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditFuncionario(funcionario)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteFuncionario(funcionario.id)}
                            >
                              Remover
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

          {fetchError && (
            <div className="text-center py-12">
              <p className="text-destructive font-medium">{fetchError}</p>
            </div>
          )}

          {funcionariosFiltrados.length === 0 && !isLoading && !fetchError && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhum funcionário encontrado</p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && funcionarios.length > 0 && (
            <div className="flex justify-between items-center py-4">
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
                  disabled={funcionarios.length < limit || (total > 0 && page * limit >= total)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
