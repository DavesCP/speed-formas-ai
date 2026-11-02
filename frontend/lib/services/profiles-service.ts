import { config } from "@/lib/config"

export interface Profile {
  id: string
  name: string
  description: string
  permissions: string[]
  usersCount: number
  color: string
}

export interface CreateProfileData {
  name: string
  description: string
  permissions: string[]
}

// Mock data
let mockProfiles: Profile[] = [
  {
    id: "admin",
    name: "Administrador",
    description: "Acesso total ao sistema",
    permissions: [
      "users.create",
      "users.edit",
      "users.delete",
      "projects.create",
      "projects.edit",
      "projects.delete",
      "settings.edit",
    ],
    usersCount: 3,
    color: "bg-red-500",
  },
  {
    id: "engineer",
    name: "Engenheiro",
    description: "Gerencia projetos e visualiza relatórios",
    permissions: ["projects.create", "projects.edit", "projects.view"],
    usersCount: 5,
    color: "bg-blue-500",
  },
  {
    id: "technician",
    name: "Técnico",
    description: "Visualiza projetos e atualiza status",
    permissions: ["projects.view", "projects.edit"],
    usersCount: 8,
    color: "bg-green-500",
  },
]

// Mock functions
const mockGetProfiles = async (): Promise<Profile[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [...mockProfiles]
}

const mockCreateProfile = async (data: CreateProfileData): Promise<Profile> => {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const colors = ["bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-indigo-500"]
  const newProfile: Profile = {
    id: String(Date.now()),
    ...data,
    usersCount: 0,
    color: colors[Math.floor(Math.random() * colors.length)],
  }

  mockProfiles.push(newProfile)
  return newProfile
}

const mockUpdateProfile = async (id: string, data: Partial<CreateProfileData>): Promise<Profile> => {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const index = mockProfiles.findIndex((p) => p.id === id)
  if (index === -1) throw new Error("Perfil não encontrado")

  mockProfiles[index] = { ...mockProfiles[index], ...data }
  return mockProfiles[index]
}

const mockDeleteProfile = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const profile = mockProfiles.find((p) => p.id === id)
  if (profile && profile.usersCount > 0) {
    throw new Error("Não é possível excluir um perfil com usuários vinculados")
  }

  mockProfiles = mockProfiles.filter((p) => p.id !== id)
}

// Real API functions
const realGetProfiles = async (): Promise<Profile[]> => {
  const response = await fetch(`${config.apiUrl}/profiles`)
  if (!response.ok) throw new Error("Erro ao buscar perfis")
  return response.json()
}

const realCreateProfile = async (data: CreateProfileData): Promise<Profile> => {
  const response = await fetch(`${config.apiUrl}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Erro ao criar perfil")
  return response.json()
}

const realUpdateProfile = async (id: string, data: Partial<CreateProfileData>): Promise<Profile> => {
  const response = await fetch(`${config.apiUrl}/profiles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Erro ao atualizar perfil")
  return response.json()
}

const realDeleteProfile = async (id: string): Promise<void> => {
  const response = await fetch(`${config.apiUrl}/profiles/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error("Erro ao deletar perfil")
}

// Export service
export const profilesService = {
  getProfiles: () => (config.useMock ? mockGetProfiles() : realGetProfiles()),
  createProfile: (data: CreateProfileData) => (config.useMock ? mockCreateProfile(data) : realCreateProfile(data)),
  updateProfile: (id: string, data: Partial<CreateProfileData>) =>
    config.useMock ? mockUpdateProfile(id, data) : realUpdateProfile(id, data),
  deleteProfile: (id: string) => (config.useMock ? mockDeleteProfile(id) : realDeleteProfile(id)),
}
