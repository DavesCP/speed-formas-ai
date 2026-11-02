export interface Project {
  id: string
  name: string
  client: string
  status: "planning" | "in-progress" | "on-hold" | "completed"
  progress: number
  startDate: string
  endDate: string
  budget: number
  manager: string
  description: string
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Edifício Residencial Centro",
    client: "Construtora ABC",
    status: "in-progress",
    progress: 85,
    startDate: "2024-01-15",
    endDate: "2024-12-20",
    budget: 2500000,
    manager: "João Silva",
    description: "Construção de edifício residencial com 12 andares no centro da cidade",
  },
  {
    id: "2",
    name: "Condomínio Jardim das Flores",
    client: "Incorporadora XYZ",
    status: "in-progress",
    progress: 60,
    startDate: "2024-02-01",
    endDate: "2025-01-30",
    budget: 4200000,
    manager: "Maria Santos",
    description: "Condomínio residencial com 8 blocos e área de lazer completa",
  },
  {
    id: "3",
    name: "Torre Comercial Norte",
    client: "Grupo Empresarial Norte",
    status: "planning",
    progress: 15,
    startDate: "2024-04-01",
    endDate: "2025-06-30",
    budget: 5800000,
    manager: "Pedro Costa",
    description: "Torre comercial de 20 andares com estacionamento subterrâneo",
  },
  {
    id: "4",
    name: "Shopping Center Sul",
    client: "Mall Investments",
    status: "in-progress",
    progress: 45,
    startDate: "2024-01-10",
    endDate: "2025-03-15",
    budget: 8500000,
    manager: "Ana Oliveira",
    description: "Shopping center com 3 pisos e 200 lojas",
  },
  {
    id: "5",
    name: "Residencial Parque Verde",
    client: "Construtora Verde",
    status: "completed",
    progress: 100,
    startDate: "2023-06-01",
    endDate: "2024-02-28",
    budget: 1800000,
    manager: "João Silva",
    description: "Condomínio residencial com 4 blocos e área verde",
  },
  {
    id: "6",
    name: "Hospital Regional",
    client: "Governo Estadual",
    status: "on-hold",
    progress: 30,
    startDate: "2024-03-01",
    endDate: "2025-12-31",
    budget: 12000000,
    manager: "Maria Santos",
    description: "Hospital regional com 200 leitos e centro cirúrgico",
  },
]
