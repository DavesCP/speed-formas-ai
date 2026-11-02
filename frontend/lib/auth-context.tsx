"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService, type AuthUser } from "@/lib/services/auth-service"

interface AuthContextType {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (user: AuthUser) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const userData = await authService.login({ username, password })
      setUser(userData)
      return true
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Erro no logout:", error)
    }
  }

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser)
    authService.updateCurrentUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
