"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Calendar, DollarSign, User, Upload, Edit, Trash2, Library, LayoutGrid, List, Eye, Sparkles, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { projectsService, type Project } from "@/lib/services/projects-service"
import { aiService, type PlantaData } from "@/lib/services/ai-service"
import { useRouter } from "next/navigation"

const STATUS_CONFIG = {
  planning: { label: "Planejamento", color: "#6b7280" },
  "in-progress": { label: "Em Andamento", color: "#d03034" },
  "on-hold": { label: "Pausado", color: "#f59e0b" },
  completed: { label: "Concluído", color: "#10b981" },
}

export default function ProjetosPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Estado para modal de IA
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [selectedProjectForAI, setSelectedProjectForAI] = useState<Project | null>(null)
  const [structuralFile, setStructuralFile] = useState<File | null>(null)
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState("")
  
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    status: "planning" as Project["status"],
    startDate: "",
    endDate: "",
    budget: "",
    description: "",
  })

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projectsService.getProjects()
        setProjects(data)
      } catch (error) {
        console.error("[v0] Erro ao carregar projetos:", error)
        toast({
          title: "Erro",
          description: "Erro ao carregar projetos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadProjects()
  }, [toast])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleOpenDialog = () => {
    setEditingProject(null)
    setFormData({
      name: "",
      client: "",
      status: "planning",
      startDate: "",
      endDate: "",
      budget: "",
      description: "",
    })
    setIsDialogOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      client: project.client,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      budget: project.budget.toString(),
      description: project.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleSaveProject = async () => {
    if (!formData.name || !formData.client || !formData.startDate) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingProject) {
        const updatedProject = await projectsService.updateProject(editingProject.id, {
          name: formData.name,
          client: formData.client,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: Number(formData.budget),
          description: formData.description,
        })
        setProjects(projects.map((p) => (p.id === editingProject.id ? updatedProject : p)))
        toast({ title: "Sucesso", description: "Projeto atualizado com sucesso" })
      } else {
        const newProject = await projectsService.createProject({
          name: formData.name,
          client: formData.client,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: Number(formData.budget),
          description: formData.description,
        })
        setProjects([...projects, newProject])
        toast({ title: "Sucesso", description: "Projeto criado com sucesso!" })
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("[v0] Erro ao salvar projeto:", error)
      toast({ title: "Erro", description: "Erro ao salvar projeto", variant: "destructive" })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return
    try {
      await projectsService.deleteProject(projectId)
      setProjects(projects.filter((p) => p.id !== projectId))
      toast({ title: "Sucesso", description: "Projeto excluído com sucesso" })
    } catch (error) {
      console.error("[v0] Erro ao excluir projeto:", error)
      toast({ title: "Erro", description: "Erro ao excluir projeto", variant: "destructive" })
    }
  }

  // Abrir modal de IA para um projeto específico
  const handleOpenAIModal = (project: Project) => {
    setSelectedProjectForAI(project)
    setStructuralFile(null)
    setIsAIModalOpen(true)
  }

  const handleStructuralFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().match(/\.pdf$/)) {
        toast({ title: "Erro", description: "Por favor, selecione um arquivo PDF válido", variant: "destructive" })
        return
      }
      setStructuralFile(file)
    }
  }

  const handleGenerateWithAI = async () => {
    if (!structuralFile || !selectedProjectForAI) {
      toast({ title: "Erro", description: "Selecione um arquivo PDF da planta", variant: "destructive" })
      return
    }

    setIsProcessingAI(true)

    try {
      const response = await aiService.processFiles({
        structuralFile,
        projectName: selectedProjectForAI.name,
        projectDescription: selectedProjectForAI.description || "",
        additionalNotes: additionalNotes || "",
      })

      if (!response.success) {
        toast({ title: "Erro na IA", description: response.message, variant: "destructive" })
        return
      }

      if (response.plantaData) {
        sessionStorage.setItem('plantaData', JSON.stringify(response.plantaData))
        sessionStorage.setItem('currentProjectId', selectedProjectForAI.id)
        setIsAIModalOpen(false)
        toast({ title: "Análise Concluída!", description: "Revise os dados extraídos antes de gerar os cortes." })
        router.push('/projetos/validacao')
      } else {
        toast({ title: "Aviso", description: "Análise concluída mas sem dados extraídos", variant: "destructive" })
      }
    } catch (error) {
      console.error("Erro no processamento com IA:", error)
      toast({ title: "Erro", description: "Erro inesperado no processamento", variant: "destructive" })
    } finally {
      setIsProcessingAI(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#1f2539" }}>
              Gerenciamento de Projetos
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Gerencie todos os projetos da empresa</p>
          </div>
          <Button
            onClick={handleOpenDialog}
            className="font-semibold w-full sm:w-auto"
            style={{ backgroundColor: "#d03034", color: "#ffffff" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        <Tabs defaultValue="historico" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="historico">Histórico de Projetos</TabsTrigger>
            <TabsTrigger value="biblioteca">
              <Library className="h-4 w-4 mr-2" />
              Biblioteca 2D
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historico" className="space-y-6">
            {/* Filtros */}
            <Card className="border-0 shadow-md">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por nome ou cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="flex-1 md:w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="planning">Planejamento</SelectItem>
                        <SelectItem value="in-progress">Em Andamento</SelectItem>
                        <SelectItem value="on-hold">Pausado</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 border rounded-lg p-1 shrink-0">
                      <Button
                        variant={viewMode === "cards" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("cards")}
                        style={viewMode === "cards" ? { backgroundColor: "#d03034", color: "#fff" } : {}}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        style={viewMode === "table" ? { backgroundColor: "#d03034", color: "#fff" } : {}}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Projetos */}
            {filteredProjects.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center text-gray-500">Nenhum projeto encontrado</CardContent>
              </Card>
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjects.map((project) => (
                  <Card key={project.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-200 group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => setViewingProject(project)}>
                          <CardTitle className="text-lg mb-2" style={{ color: "#1f2539" }}>
                            {project.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{project.client}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge style={{ backgroundColor: STATUS_CONFIG[project.status].color, color: "#ffffff" }}>
                            {STATUS_CONFIG[project.status].label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progresso</span>
                          <span className="font-semibold" style={{ color: "#1f2539" }}>{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%`, backgroundColor: STATUS_CONFIG[project.status].color }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Início</p>
                            <p className="text-sm font-medium" style={{ color: "#1f2539" }}>{formatDate(project.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Orçamento</p>
                            <p className="text-sm font-medium" style={{ color: "#1f2539" }}>{formatCurrency(project.budget)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteProject(project.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Botão Gerar com IA */}
                        <Button
                          size="sm"
                          className="font-medium"
                          style={{ backgroundColor: "#10b981", color: "#fff" }}
                          onClick={() => handleOpenAIModal(project)}
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          Gerar com IA
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Visualização em Tabela */
              <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: "#1f2539" }}>Projeto</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: "#1f2539" }}>Cliente</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: "#1f2539" }}>Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-sm" style={{ color: "#1f2539" }}>Início</th>
                          <th className="text-right py-4 px-6 font-semibold text-sm" style={{ color: "#1f2539" }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map((project) => (
                          <tr key={project.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              <span className="font-medium" style={{ color: "#1f2539" }}>{project.name}</span>
                            </td>
                            <td className="py-4 px-6 text-gray-600">{project.client}</td>
                            <td className="py-4 px-6">
                              <Badge style={{ backgroundColor: STATUS_CONFIG[project.status].color, color: "#ffffff" }}>
                                {STATUS_CONFIG[project.status].label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-gray-600">{formatDate(project.startDate)}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingProject(project)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditProject(project)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteProject(project.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  style={{ backgroundColor: "#10b981", color: "#fff" }}
                                  onClick={() => handleOpenAIModal(project)}
                                >
                                  <Sparkles className="h-4 w-4 mr-1" />
                                  IA
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="biblioteca">
            <Card className="border-0 shadow-md">
              <CardContent className="py-16 text-center">
                <Library className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2" style={{ color: "#1f2539" }}>Biblioteca de Projetos 2D</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Aqui ficarão armazenados os projetos 2D. Funcionalidade em desenvolvimento.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Criar/Editar Projeto */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingProject ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
              <DialogDescription>
                {editingProject ? "Atualize as informações do projeto" : "Preencha as informações do novo projeto"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Edifício Residencial"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Input
                  id="client"
                  placeholder="Nome do cliente"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Project["status"]) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planejamento</SelectItem>
                      <SelectItem value="in-progress">Em Andamento</SelectItem>
                      <SelectItem value="on-hold">Pausado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento (R$)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o projeto"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveProject} style={{ backgroundColor: "#d03034", color: "#ffffff" }}>
                {editingProject ? "Atualizar" : "Criar Projeto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Visualizar Projeto */}
        <Dialog open={!!viewingProject} onOpenChange={() => setViewingProject(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{viewingProject?.name}</DialogTitle>
              <DialogDescription>{viewingProject?.client}</DialogDescription>
            </DialogHeader>
            {viewingProject && (
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <Badge style={{ backgroundColor: STATUS_CONFIG[viewingProject.status].color, color: "#ffffff" }}>
                    {STATUS_CONFIG[viewingProject.status].label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Data de Início</p>
                    <p className="font-medium">{formatDate(viewingProject.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Orçamento</p>
                    <p className="font-medium">{formatCurrency(viewingProject.budget)}</p>
                  </div>
                </div>
                {viewingProject.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Descrição</p>
                    <p className="text-sm">{viewingProject.description}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setViewingProject(null)}>Fechar</Button>
              <Button
                style={{ backgroundColor: "#10b981", color: "#fff" }}
                onClick={() => {
                  if (viewingProject) {
                    setViewingProject(null)
                    handleOpenAIModal(viewingProject)
                  }
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar com IA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Gerar com IA */}
        <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: "#10b981" }} />
                Gerar Cortes com IA
              </DialogTitle>
              <DialogDescription>
                Projeto: <strong>{selectedProjectForAI?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Como funciona:</strong> Faça upload da planta estrutural em PDF. 
                  A IA irá analisar e extrair as dimensões de todas as paredes, 
                  depois você poderá revisar e gerar os cortes das placas.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Planta Estrutural (PDF) *</Label>
                <div className="relative w-full min-h-[150px] py-8 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 flex flex-col items-center justify-center gap-3 bg-green-50/30 transition-all cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handleStructuralFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <FileText className="h-12 w-12 text-green-500 pointer-events-none" />
                  {structuralFile ? (
                    <div className="text-center pointer-events-none">
                      <p className="text-base font-medium text-green-600">✓ {structuralFile.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{(structuralFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-center pointer-events-none">
                      <p className="text-base font-medium text-green-700">Clique para selecionar o PDF</p>
                      <p className="text-sm text-gray-500 mt-1">Arraste ou clique aqui</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Observações Adicionais (opcional)</Label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Ex: Pé-direito de 3m, paredes de 20cm de espessura, considerar janelas de 1.20m x 1.00m..."
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500">
                  Adicione informações que a IA deve considerar na análise da planta (medidas específicas, observações, correções, etc.)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAIModalOpen(false)} disabled={isProcessingAI}>
                Cancelar
              </Button>
              <Button 
                onClick={handleGenerateWithAI}
                disabled={!structuralFile || isProcessingAI}
                style={{ backgroundColor: "#10b981", color: "#fff" }}
              >
                {isProcessingAI ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analisar com IA
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
