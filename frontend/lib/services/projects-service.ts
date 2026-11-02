import { config } from "@/lib/config"

export interface Project {
  id: string
  name: string
  client: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  progress: number
  startDate: string
  endDate: string
  budget: number
  team: string[]
  description: string
}

export interface CreateProjectData {
  name: string
  client: string
  status: "planning" | "in-progress" | "completed" | "on-hold"
  startDate: string
  endDate: string
  budget: number
  description: string
}

// Converter do formato do backend para o frontend
const mapBackendToFrontend = (data: any): Project => ({
  id: String(data.id),
  name: data.name,
  client: data.client,
  status: data.status,
  progress: data.progress || 0,
  startDate: data.startDate,
  endDate: data.endDate || "",
  budget: data.budget || 0,
  team: data.team || [],
  description: data.description || "",
})

// API functions
const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch(`${config.apiUrl}/projects`)
    if (!response.ok) {
      console.warn("Resposta não-ok ao buscar projetos:", response.status)
      return [] // Retorna array vazio em vez de lançar erro
    }
    const data = await response.json()
    return data.map(mapBackendToFrontend)
  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return [] // Retorna array vazio em caso de erro de rede
  }
}

const getProjectById = async (id: string): Promise<Project> => {
  const response = await fetch(`${config.apiUrl}/projects/${id}`)
  if (!response.ok) {
    throw new Error("Erro ao buscar projeto")
  }
  const data = await response.json()
  return mapBackendToFrontend(data)
}

const createProject = async (data: CreateProjectData): Promise<Project> => {
  const response = await fetch(`${config.apiUrl}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Erro ao criar projeto")
  }
  const result = await response.json()
  return mapBackendToFrontend(result)
}

const updateProject = async (id: string, data: Partial<CreateProjectData>): Promise<Project> => {
  const response = await fetch(`${config.apiUrl}/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error("Erro ao atualizar projeto")
  }
  const result = await response.json()
  return mapBackendToFrontend(result)
}

const deleteProject = async (id: string): Promise<void> => {
  const response = await fetch(`${config.apiUrl}/projects/${id}`, {
    method: "DELETE",
  })
  if (!response.ok) {
    throw new Error("Erro ao deletar projeto")
  }
}

// Export service
export const projectsService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
}
