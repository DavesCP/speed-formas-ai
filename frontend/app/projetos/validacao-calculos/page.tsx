"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Scissors, 
  AlertTriangle, 
  CheckCircle, 
  Edit2,
  Calculator,
  Package,
  Sparkles,
  Save
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { aiService, type PlantaData, type GerarCortesResponse } from "@/lib/services/ai-service"
import { cortesStore } from "@/lib/stores/cortes-store"

// Tipos para os cálculos (conforme backend retorna)
interface PlacaCorte {
  altura: number
  comprimento: number
}

interface RecortePlaca {
  largura: number
  altura: number
  posicaoX: number
  posicaoY: number
}

interface PlacaComRecorte {
  numeroPlaca: number
  larguraPlaca: number
  alturaPlaca: number
  recortes: RecortePlaca[]
}

interface PlacaCorteAlturaEComprimentoPosicaoY {
  qtdPlacas: number
  placas: PlacaComRecorte[]
}

interface CalculoParede {
  identificador: string
  placasInteiras: number
  qtdPlacasCorteComprimento: number
  placaCorteComprimento: PlacaCorte | null
  qtdPlacasCorteAltura: number
  placaCorteAltura: PlacaCorte | null
  qtdPlacaCorteAlturaEComprimento: number
  placaCorteAlturaEComprimento: PlacaCorte[]
  placasComRecortes: any | null
  placaCorteAlturaEComprimentoPosicaoY: PlacaCorteAlturaEComprimentoPosicaoY | null
  totalPlacas: number
}

interface ComodoCalculo {
  nomeComodo: string
  paredes: CalculoParede[]
}

interface CalculoPlanta {
  nome: string
  unidadeMedida: string
  comodosCalculados: ComodoCalculo[]
}

export default function ValidacaoCalculosPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [plantaData, setPlantaData] = useState<PlantaData | null>(null)
  const [calculosData, setCalculosData] = useState<CalculoPlanta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isGeneratingCuts, setIsGeneratingCuts] = useState(false)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Recuperar dados da planta
    const storedPlanta = sessionStorage.getItem('plantaData')
    if (storedPlanta) {
      try {
        const planta = JSON.parse(storedPlanta)
        setPlantaData(planta)
        
        // Buscar cálculos do backend
        await fetchCalculos(planta)
      } catch (e) {
        console.error("Erro ao recuperar dados:", e)
      }
    }
    setIsLoading(false)
  }

  const fetchCalculos = async (planta: PlantaData) => {
    setIsCalculating(true)
    try {
      const response = await fetch('http://localhost:8085/api/v1/ia/calcular-cortes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planta),
      })

      if (response.ok) {
        const calculos = await response.json()
        setCalculosData(calculos)
        sessionStorage.setItem('calculosData', JSON.stringify(calculos))
      } else {
        throw new Error('Erro ao calcular cortes')
      }
    } catch (error) {
      console.error("Erro ao buscar cálculos:", error)
      toast({
        title: "Erro",
        description: "Não foi possível calcular os cortes. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleUpdateCalculoValue = (
    comodoIndex: number,
    paredeIndex: number,
    field: keyof CalculoParede,
    value: number
  ) => {
    if (!calculosData) return

    const newCalculos = { ...calculosData }
    const paredes = newCalculos.comodosCalculados[comodoIndex].paredes
    ;(paredes[paredeIndex] as any)[field] = value
    
    // Recalcular total
    const p = paredes[paredeIndex]
    paredes[paredeIndex].totalPlacas = 
      p.placasInteiras +
      p.qtdPlacasCorteComprimento +
      p.qtdPlacasCorteAltura +
      p.qtdPlacaCorteAlturaEComprimento +
      (p.placaCorteAlturaEComprimentoPosicaoY?.qtdPlacas || 0)

    setCalculosData(newCalculos)
    sessionStorage.setItem('calculosData', JSON.stringify(newCalculos))
  }

  const handleRecalculate = async () => {
    if (plantaData) {
      await fetchCalculos(plantaData)
      toast({
        title: "Recalculado",
        description: "Os cálculos foram atualizados com sucesso!",
      })
    }
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
        title: "Gerando imagens de cortes...",
        description: `Usando método ${metodo}. Aguarde...`,
      })

      const response = await aiService.generateCuts(plantaData, useIA)
      
      if (response.success) {
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

  const getTotalPlacas = () => {
    if (!calculosData) return 0
    return calculosData.comodosCalculados.reduce((acc, comodo) => 
      acc + comodo.paredes.reduce((acc2, parede) => acc2 + parede.totalPlacas, 0), 0
    )
  }

  const getTotalParedes = () => {
    if (!calculosData) return 0
    return calculosData.comodosCalculados.reduce((acc, comodo) => acc + comodo.paredes.length, 0)
  }

  if (isLoading || isCalculating) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#d03034" }}></div>
          <p className="text-gray-600">
            {isCalculating ? "Calculando cortes..." : "Carregando..."}
          </p>
        </div>
      </DashboardLayout>
    )
  }

  if (!calculosData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1f2539" }}>
                Nenhum cálculo disponível
              </h2>
              <p className="text-gray-600 mb-6">
                Primeiro valide os dados da planta para poder visualizar os cálculos.
              </p>
              <Button onClick={() => router.push('/projetos/validacao')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Validação
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/projetos/validacao')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "#1f2539" }}>
                Validação dos Cálculos de Cortes
              </h1>
              <p className="text-gray-600">
                Revise as quantidades de placas e medidas de corte antes de gerar as imagens
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRecalculate}>
              <Calculator className="h-4 w-4 mr-2" />
              Recalcular
            </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Cômodos</p>
                  <p className="text-3xl font-bold" style={{ color: "#d03034" }}>
                    {calculosData.comodosCalculados.length}
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
                  <p className="text-sm text-gray-600">Total de Placas</p>
                  <p className="text-3xl font-bold" style={{ color: "#10b981" }}>
                    {getTotalPlacas()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100">
                  <Package className="h-6 w-6 text-green-600" />
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
                    Pronto para gerar
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Cálculos automáticos</p>
            <p className="text-sm text-blue-700">
              Os cálculos abaixo foram gerados automaticamente baseados nas dimensões das paredes.
              Você pode ajustar manualmente qualquer valor antes de gerar as imagens de corte.
            </p>
          </div>
        </div>

        {/* Calculations per Room */}
        <div className="space-y-6 mb-8">
          {calculosData.comodosCalculados.map((comodo, comodoIndex) => (
            <Card key={comodoIndex} className="border-0 shadow-md overflow-hidden">
              <CardHeader className="py-4" style={{ backgroundColor: "#fef2f2" }}>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">🏠</span>
                  <span style={{ color: "#d03034" }}>{comodo.nomeComodo}</span>
                  <Badge variant="outline" className="ml-2">
                    {comodo.paredes.length} paredes
                  </Badge>
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    {comodo.paredes.reduce((acc, p) => acc + p.totalPlacas, 0)} placas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {comodo.paredes.map((parede, paredeIndex) => (
                    <div key={paredeIndex} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <p className="font-bold text-lg" style={{ color: "#1f2539" }}>
                            Parede {parede.identificador}
                          </p>
                          <Badge className="bg-blue-100 text-blue-800">
                            Total: {parede.totalPlacas} placas
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* Placas Inteiras */}
                        <div className="space-y-1 bg-gray-50 p-3 rounded-lg">
                          <Label className="text-xs text-gray-500">Placas Inteiras</Label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={parede.placasInteiras}
                              onChange={(e) => handleUpdateCalculoValue(
                                comodoIndex, paredeIndex, 'placasInteiras', Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-xl font-bold text-green-600">
                              {parede.placasInteiras}
                            </p>
                          )}
                        </div>
                        
                        {/* Corte Comprimento */}
                        <div className="space-y-1 bg-yellow-50 p-3 rounded-lg">
                          <Label className="text-xs text-gray-500">Corte Comprimento</Label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={parede.qtdPlacasCorteComprimento}
                              onChange={(e) => handleUpdateCalculoValue(
                                comodoIndex, paredeIndex, 'qtdPlacasCorteComprimento', Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-xl font-bold text-yellow-600">
                              {parede.qtdPlacasCorteComprimento}
                            </p>
                          )}
                          {parede.placaCorteComprimento && (
                            <p className="text-xs text-gray-500">
                              {parede.placaCorteComprimento.comprimento?.toFixed(2)} m
                            </p>
                          )}
                        </div>
                        
                        {/* Corte Altura */}
                        <div className="space-y-1 bg-orange-50 p-3 rounded-lg">
                          <Label className="text-xs text-gray-500">Corte Altura</Label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={parede.qtdPlacasCorteAltura}
                              onChange={(e) => handleUpdateCalculoValue(
                                comodoIndex, paredeIndex, 'qtdPlacasCorteAltura', Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-xl font-bold text-orange-600">
                              {parede.qtdPlacasCorteAltura}
                            </p>
                          )}
                          {parede.placaCorteAltura && (
                            <p className="text-xs text-gray-500">
                              {parede.placaCorteAltura.altura?.toFixed(2)} m
                            </p>
                          )}
                        </div>
                        
                        {/* Corte Altura + Comprimento */}
                        <div className="space-y-1 bg-red-50 p-3 rounded-lg">
                          <Label className="text-xs text-gray-500">Altura + Comprimento</Label>
                          {editMode ? (
                            <Input
                              type="number"
                              value={parede.qtdPlacaCorteAlturaEComprimento}
                              onChange={(e) => handleUpdateCalculoValue(
                                comodoIndex, paredeIndex, 'qtdPlacaCorteAlturaEComprimento', Number(e.target.value)
                              )}
                              className="h-9"
                            />
                          ) : (
                            <p className="text-xl font-bold text-red-600">
                              {parede.qtdPlacaCorteAlturaEComprimento}
                            </p>
                          )}
                          {parede.placaCorteAlturaEComprimento && parede.placaCorteAlturaEComprimento.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {parede.placaCorteAlturaEComprimento[0].altura?.toFixed(2)} m x {parede.placaCorteAlturaEComprimento[0].comprimento?.toFixed(2)} m
                            </p>
                          )}
                        </div>

                        {/* Placas com Recortes (Aberturas - Janelas/Portas) */}
                        {parede.placaCorteAlturaEComprimentoPosicaoY && parede.placaCorteAlturaEComprimentoPosicaoY.qtdPlacas > 0 && (
                          <div className="space-y-1 bg-purple-50 p-3 rounded-lg col-span-2">
                            <Label className="text-xs text-gray-500">Placas com Recortes (Aberturas)</Label>
                            <p className="text-xl font-bold text-purple-600">
                              {parede.placaCorteAlturaEComprimentoPosicaoY.qtdPlacas}
                            </p>
                            <div className="text-xs text-gray-500 space-y-1 mt-1">
                              {parede.placaCorteAlturaEComprimentoPosicaoY.placas.map((placa, idx) => (
                                <div key={idx} className="border-l-2 border-purple-300 pl-2">
                                  <span className="font-medium">Placa {placa.numeroPlaca}:</span> {placa.larguraPlaca?.toFixed(2)}m x {placa.alturaPlaca?.toFixed(2)}m
                                  {placa.recortes && placa.recortes.length > 0 && (
                                    <div className="ml-2 text-purple-600">
                                      {placa.recortes.map((r, ri) => (
                                        <div key={ri}>
                                          Recorte: {r.largura?.toFixed(2)}m x {r.altura?.toFixed(2)}m @ ({r.posicaoX?.toFixed(2)}, {r.posicaoY?.toFixed(2)})
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 sticky bottom-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="outline" onClick={() => router.push('/projetos/validacao')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Dados
            </Button>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Botão Geração Local (Frontend) */}
              <Button
                size="lg"
                className="font-semibold px-6 w-full sm:w-auto"
                style={{ backgroundColor: "#1a365d", color: "#ffffff" }}
                onClick={() => router.push('/projetos/cortes-local')}
                disabled={isGeneratingCuts}
              >
                <Scissors className="h-4 w-4 mr-2" />
                Gerar Local (Rápido)
              </Button>

              {/* Botão Padrão SpeedFormas (Backend) */}
              <Button
                size="lg"
                variant="outline"
                className="font-semibold px-6 w-full sm:w-auto border-2"
                style={{ borderColor: "#d03034", color: "#d03034" }}
                onClick={() => handleGenerateCuts(false)}
                disabled={isGeneratingCuts}
              >
                {isGeneratingCuts ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" style={{ borderColor: "#d03034" }}></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    Backend (Padrão)
                  </>
                )}
              </Button>

              {/* Botão com IA */}
              <Button
                size="lg"
                variant="outline"
                className="font-semibold px-6 w-full sm:w-auto border-2"
                style={{ borderColor: "#10b981", color: "#10b981" }}
                onClick={() => handleGenerateCuts(true)}
                disabled={isGeneratingCuts}
              >
                {isGeneratingCuts ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar com IA
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            <strong>Local:</strong> Geração instantânea no navegador (recomendado) | 
            <strong className="ml-2">Backend:</strong> Usa servidor | 
            <strong className="ml-2">IA:</strong> Gemini AI (mais lento)
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

