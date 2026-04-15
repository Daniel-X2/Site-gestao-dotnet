"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Building2, Lock, User } from "lucide-react"

export default function LoginPage() {
  const [cpf, setCpf] = useState("12345678911")
  const [senha, setSenha] = useState("123")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    if (!cpf || !senha) {
      setError("Por favor, preencha todos os campos")
      setIsSubmitting(false)
      return
    }

    const success = await login(cpf, senha)
    if (success) {
      router.push("/dashboard")
    } else {
      setError("Credenciais inválidas")
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sistema de Gestão</h1>
          <p className="text-muted-foreground text-sm mt-1">Acesse sua conta para continuar</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Entrar</CardTitle>
            <CardDescription>Insira suas credenciais abaixo</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cpf">CPF</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="Somente números ou com formatação"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="senha">Senha</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="senha"
                      type="password"
                      placeholder="••••••••"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </Field>
              </FieldGroup>

              {error && (
                <p className="text-destructive text-sm mt-4 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Use CPF 12345678911 e senha 123 para demonstração
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao entrar, você concorda com nossos Termos de Serviço
        </p>
      </div>
    </div>
  )
}
