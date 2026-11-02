"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Scissors, AlertTriangle, CheckCircle, Edit2, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { aiService, type PlantaData, type GerarCortesResponse } from "@/lib/services/ai-service"
import { cortesStore } from "@/lib/stores/cortes-store"

export default function ValidacaoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [plantaData, setPlantaData] = useState<PlantaData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingCuts, setIsGeneratingCuts] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    // Tenta recuperar os dados da sessão/localStorage
    const storedData = sessionStorage.getItem('plantaData')
    if (storedData) {
      try {
        setPlantaData(JSON.parse(storedData))
      } catch (e) {
        console.error("Erro ao recuperar dados:", e)
      }
    }
    setIsLoading(false)
  }, [])

  const handleUpdateParedeValue = (
    comodoIndex: number, 
    paredeIndex: number, 
    field: 'comprimento' | 'altura' | 'largura' | 'quantidadeLP', 
    value: number
  ) => {
    if (!plantaData) return
    
    const newPlantaData = { ...plantaData }
    newPlantaData.comodos[comodoIndex].paredes[paredeIndex][field] = value
    setPlantaData(newPlantaData)
    sessionStorage.setItem('plantaData', JSON.stringify(newPlantaData))
  }

  const handleGenerateCuts = async (useIA: boolean = false) => {
    if (!plantaData) {
      toast({
        title: "Erro",
        description: "Dados da planta não disponíveis",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingCuts(true)

    try {
      const metodo = useIA ? "IA" : "padrão SpeedFormas"
      toast({
        title: "Gerando cortes...",
        description: `Usando método ${metodo}. Aguarde...`,
      })

      const response = await aiService.generateCuts(plantaData, useIA)
      
      if (response.success) {
        // Salva os cortes no store global (evita limite do sessionStorage)
        cortesStore.set(response)
        router.push('/projetos/cortes')
      } else {
        toast({
          title: "Erro",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao gerar cortes:", error)
      toast({
        title: "Erro",
        description: "Erro inesperado ao gerar cortes",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCuts(false)
    }
  }

  const getTotalParedes = () => {
    if (!plantaData) return 0
    return plantaData.comodos.reduce((acc, comodo) => acc + comodo.paredes.length, 0)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#d03034" }}></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!plantaData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1f2539" }}>
                Nenhum dado para validar
              </h2>
              <p className="text-gray-600 mb-6">
                Faça upload de uma planta estrutural primeiro para extrair os dados para validação.
              </p>
              <Button onClick={() => router.push('/projetos')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Projetos
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/projetos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#1f2539" }}>
                Validação dos Dados Extraídos
              </h1>
              <p className="text-gray-600">
                Revise e corrija os valores extraídos pela IA antes de gerar os cortes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => setEditMode(!editMode)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {editMode ? "Visualização" : "Editar Valores"}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Cômodos</p>
                  <p className="text-3xl font-bold" style={{ color: "#d03034" }}>
                    {plantaData.comodos.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fef2f2" }}>
                  <span className="text-2xl">🏠</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Paredes</p>
                  <p className="text-3xl font-bold" style={{ color: "#1f2539" }}>
                    {getTotalParedes()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f0f9ff" }}>
                  <span className="text-2xl">🧱</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-green-600">
                    Pronto para cortes
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Importante</p>
            <p className="text-sm text-yellow-700">
              Verifique cuidadosamente os valores extraídos pela IA. Valores incorretos podem resultar em cortes errados.
              Clique em "Editar Valores" para fazer ajustes.
            </p>
          </div>
        </div>

        {/* Rooms and Walls */}
        <div className="space-y-6 mb-8">
          {plantaData.comodos.map((comodo, comodoIndex) => (
            <Card key={comodoIndex} className="border-0 shadow-md overflow-hidden">
              <CardHeader className="py-4" style={{ backgroundColor: "#fef2f2" }}>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🏠</span>
                  <span style={{ color: "#d03034" }}>{comodo.nomeComodo}</span>
                  <Badge variant="outline" className="ml-2">
                    {comodo.paredes.length} paredes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {comodo.paredes.map((parede, paredeIndex) => (
                    <div key={paredeIndex} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium" style={{ color: "#1f2539" }}>
                          Parede: {parede.identificacaoParede}
                        </p>
                        {!editMode && (
                          <Badge style={{ backgroundColor: "#10b981", color: "#fff" }}>
                            Validado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Comprimento (m)</Label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={parede.comprimento}
                              onChange={(e) => handleUpdateParedeValue(
                                comodoIndex, paredeIndex, 'comprimento', Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-lg font-semibold" style={{ color: "#1f2539" }}>
                              {parede.comprimento} m
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Altura (m)</Label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={parede.altura}
                              onChange={(e) => handleUpdateParedeValue(
                                comodoIndex, paredeIndex, 'altura', Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-lg font-semibold" style={{ color: "#1f2539" }}>
                              {parede.altura} m
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Largura (m)</Label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={parede.largura}
                              onChange={(e) => handleUpdateParedeValue(
                                comodoIndex, paredeIndex, 'largura', Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-lg font-semibold" style={{ color: "#1f2539" }}>
                              {parede.largura} m
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Quantidade LP</Label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={parede.quantidadeLP}
                              onChange={(e) => handleUpdateParedeValue(
                                comodoIndex, paredeIndex, 'quantidadeLP', Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-lg font-semibold" style={{ color: "#1f2539" }}>
                              {parede.quantidadeLP}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Portas e Janelas */}
                      {((parede.portas && parede.portas.length > 0) || (parede.janelas && parede.janelas.length > 0)) && (
                        <div className="mt-4 pt-3 border-t border-dashed">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Portas */}
                            {parede.portas && parede.portas.length > 0 && (
                              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">🚪</span>
                                  <span className="font-medium text-amber-800">
                                    {parede.portas.length} Porta{parede.portas.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                                {parede.portas.map((porta: any, portaIdx: number) => (
                                  <div key={portaIdx} className="text-sm text-amber-700 ml-6">
                                    <span className="font-medium">Porta {portaIdx + 1}:</span>{' '}
                                    {porta.comprimento}m × {porta.altura}m
                                    <span className="text-xs text-amber-600 ml-2">
                                      (X: {porta.posicaoX}m, Y: {porta.posicaoY}m)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Janelas */}
                            {parede.janelas && parede.janelas.length > 0 && (
                              <div className="bg-sky-50 rounded-lg p-3 border border-sky-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">🪟</span>
                                  <span className="font-medium text-sky-800">
                                    {parede.janelas.length} Janela{parede.janelas.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                                {parede.janelas.map((janela: any, janelaIdx: number) => (
                                  <div key={janelaIdx} className="text-sm text-sky-700 ml-6">
                                    <span className="font-medium">Janela {janelaIdx + 1}:</span>{' '}
                                    {janela.comprimento}m × {janela.altura}m
                                    <span className="text-xs text-sky-600 ml-2">
                                      (X: {janela.posicaoX}m, Solo: {janela.posicaoSolo}m)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="outline" onClick={() => router.push('/projetos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Botão para ir à Validação de Cálculos */}
              <Button
                size="lg"
                className="font-semibold px-6 w-full sm:w-auto"
                style={{ backgroundColor: "#d03034", color: "#ffffff" }}
                onClick={() => {
                  // Salvar dados e ir para validação de cálculos
                  sessionStorage.setItem('plantaData', JSON.stringify(plantaData))
                  router.push('/projetos/validacao-calculos')
                }}
              >
                <Scissors className="h-4 w-4 mr-2" />
                Calcular Cortes
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Os dados serão usados para calcular automaticamente a quantidade de placas e medidas de corte.
            Você poderá revisar e ajustar os cálculos antes de gerar as imagens.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

