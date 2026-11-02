export interface User {
  id: string
  name: string
  email: string
  role: string
  profileId: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Profile {
  id: string
  name: string
  description: string
  permissions: string[]
}

// Mock de perfis
export const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Administrador",
    description: "Acesso completo ao sistema",
    permissions: ["users.create", "users.edit", "users.delete", "projects.all", "settings.all"],
  },
  {
    id: "2",
    name: "Gerente",
    description: "Gerenciamento de projetos e equipe",
    permissions: ["projects.create", "projects.edit", "users.view", "reports.view"],
  },
  {
    id: "3",
    name: "Usuário",
    description: "Acesso básico ao sistema",
    permissions: ["projects.view", "reports.view"],
  },
]

// Mock de usuários
export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Administrador Sistema",
    email: "admin@speedforma.com.br",
    role: "admin",
    profileId: "1",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao.silva@speedforma.com.br",
    role: "manager",
    profileId: "2",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Maria Santos",
    email: "maria.santos@speedforma.com.br",
    role: "user",
    profileId: "3",
    status: "active",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Pedro Costa",
    email: "pedro.costa@speedforma.com.br",
    role: "user",
    profileId: "3",
    status: "active",
    createdAt: "2024-03-15",
  },
  {
    id: "5",
    name: "Ana Oliveira",
    email: "ana.oliveira@speedforma.com.br",
    role: "manager",
    profileId: "2",
    status: "inactive",
    createdAt: "2024-02-01",
  },
]
