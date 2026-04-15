"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  cpf?: string
  email?: string
  role: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (cpf: string, senha: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Função auxiliar para interpretar a carga do JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há usuário salvo na sessão
    const savedUser = sessionStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (cpf: string, senha: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cpf, senha })
      })

      if (response.ok) {
        let data
        try {
          data = await response.json()
        } catch(e) {
          data = await response.text()
          alert("O servidor não respondeu JSON. A resposta foi: " + data)
        }
        let token = data.token || data.accessToken || data.access_token || data.jwt || data.bearer
        if (!token && typeof data === 'string') token = data

        if (token) {
          // Salva o token localmente (pode ser localStorage também)
          sessionStorage.setItem("token", token)

          // Decodifica o JWT Bearer para descobrir Admin/User
          const decoded = parseJwt(token)
          
          const role = decoded?.role || decoded?.cargo || decoded?.perfil || "User"
          
          const userData: User = {
            id: decoded?.sub || decoded?.id || String(Date.now()),
            name: decoded?.name || decoded?.nome || "Usuário",
            cpf: cpf,
            role: role
          }

          setUser(userData)
          sessionStorage.setItem("user", JSON.stringify(userData))
          
          setIsLoading(false)
          return true
        } else {
          alert("O servidor respondeu isso, mas não achei o token aí dentro: " + JSON.stringify(data))
        }
      } else {
        const errText = await response.text()
        alert("A API rejeitou com código: " + response.status + ". Erro retornado: " + errText)
      }
      
      setIsLoading(false)
      return false
      
    } catch (error) {
      console.error("Erro de conexão com API:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem("user")
    sessionStorage.removeItem("token")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
