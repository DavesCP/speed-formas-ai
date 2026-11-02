import { config } from "@/lib/config"

// Interface que corresponde ao backend UserRole
export interface User {
  id: number
  name: string
  cpf: string
  address: string
  email: string
  username: string
  role: "ADMIN" | "USER"
}

export interface CreateUserData {
  name: string
  cpf: string
  address: string
  email: string
  username: string
  password: string
  role: "ADMIN" | "USER"
}

export interface UpdateUserData {
  name?: string
  cpf?: string
  address?: string
  email?: string
  username?: string
  password?: string
  role?: "ADMIN" | "USER"
}

// Real API functions - conectando ao backend Spring Boot
const getUsers = async (): Promise<User[]> => {
  const response = await fetch(`${config.apiUrl}/users`)
  if (!response.ok) throw new Error("Erro ao buscar usuários")
  return response.json()
}

const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await fetch(`${config.apiUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Erro ao criar usuário")
  }
  return response.json()
}

const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
  const response = await fetch(`${config.apiUrl}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Erro ao atualizar usuário")
  }
  return response.json()
}

const deleteUser = async (id: number): Promise<void> => {
  const response = await fetch(`${config.apiUrl}/users/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Erro ao deletar usuário")
}

// Export service
export const usersService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
}
