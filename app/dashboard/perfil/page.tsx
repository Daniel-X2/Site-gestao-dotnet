"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { User, Mail, Briefcase, Shield, Bell, Lock, Check } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function PerfilPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome: user?.name || "",
    email: user?.email || "",
    cargo: user?.role || "",
    telefone: "(11) 99999-0000",
  })
  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: false,
    relatorios: true,
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">Alterações salvas com sucesso!</span>
        </div>
      )}

      {/* Profile Card */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {getInitials(formData.nome)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{formData.nome}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4" />
                  {formData.cargo}
                </CardDescription>
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancelar" : "Editar Perfil"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="nome">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </span>
                  </FieldLabel>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </span>
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cargo">
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Cargo
                    </span>
                  </FieldLabel>
                  <Input
                    id="cargo"
                    value={formData.cargo}
                    onChange={(e) =>
                      setFormData({ ...formData, cargo: e.target.value })
                    }
                    disabled
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="telefone">Telefone</FieldLabel>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </Field>
              </div>
            </FieldGroup>

            {isEditing && (
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Spinner className="mr-2" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>Gerencie suas preferências de notificação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Notificações por Email</p>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações importantes no seu email
                </p>
              </div>
              <Switch
                checked={notificacoes.email}
                onCheckedChange={(checked) =>
                  setNotificacoes({ ...notificacoes, email: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border/50">
              <div>
                <p className="font-medium text-foreground">Notificações Push</p>
                <p className="text-sm text-muted-foreground">
                  Receba notificações em tempo real no navegador
                </p>
              </div>
              <Switch
                checked={notificacoes.push}
                onCheckedChange={(checked) =>
                  setNotificacoes({ ...notificacoes, push: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border/50">
              <div>
                <p className="font-medium text-foreground">Relatórios Semanais</p>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo semanal das atividades
                </p>
              </div>
              <Switch
                checked={notificacoes.relatorios}
                onCheckedChange={(checked) =>
                  setNotificacoes({ ...notificacoes, relatorios: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>Gerencie a segurança da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">
                  Atualize sua senha periodicamente para maior segurança
                </p>
              </div>
              <Button variant="outline">Alterar</Button>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border/50">
              <div>
                <p className="font-medium text-foreground">Autenticação em Duas Etapas</p>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de proteção à sua conta
                </p>
              </div>
              <Button variant="outline">Configurar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
