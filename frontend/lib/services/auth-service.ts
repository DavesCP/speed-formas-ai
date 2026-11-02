import { config } from "@/lib/config"

export interface AuthUser {
  id: number
  name: string
  email: string
  username: string
  role: "ADMIN" | "USER"
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  id: number
  name: string
  email: string
  username: string
  role: "ADMIN" | "USER"
  message: string
}

// Login real no backend
const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
  const response = await fetch(`${config.apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  })

  const data: LoginResponse = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Credenciais inválidas")
  }

  // Salva o usuário no localStorage
  const user: AuthUser = {
    id: data.id,
    name: data.name,
    email: data.email,
    username: data.username,
    role: data.role,
  }
  
  localStorage.setItem("speedforma_user", JSON.stringify(user))
  
  return user
}

const logout = async (): Promise<void> => {
  localStorage.removeItem("speedforma_user")
}

const getCurrentUser = async (): Promise<AuthUser | null> => {
  const userStr = localStorage.getItem("speedforma_user")
  if (userStr) {
    return JSON.parse(userStr)
  }
  return null
}

const updateCurrentUser = (user: AuthUser): void => {
  localStorage.setItem("speedforma_user", JSON.stringify(user))
}

export const authService = {
  login,
  logout,
  getCurrentUser,
  updateCurrentUser,
}
