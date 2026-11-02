"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Printer, FileText, CheckCircle, Scissors, Package, AlertTriangle, Eye, LayoutGrid, List, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { GerarCortesResponse, CorteImagem } from "@/lib/services/ai-service"
import { cortesStore } from "@/lib/stores/cortes-store"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CortesPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [cortesData, setCortesData] = useState<GerarCortesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCorte, setSelectedCorte] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [expandedCorte, setExpandedCorte] = useState<number | null>(null)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    // Usa o store global em vez do sessionStorage (evita limite de 5MB)
    const storedData = cortesStore.get()
    if (storedData) {
      setCortesData(storedData)
    }
    setIsLoading(false)
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleExportPDF = () => {
    toast({
      title: "Em desenvolvimento",
      description: "Exportação de PDF será implementada em breve",
    })
  }

  const handleDownloadSVG = (corte: CorteImagem, index: number) => {
    if (!corte.svgCorte) return
    
    const blob = new Blob([corte.svgCorte], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `corte-${corte.nomeComodo}-${corte.identificacao}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Download iniciado",
      description: `Corte ${corte.identificacao} salvo como SVG`,
    })
  }

  const getTotals = () => {
    if (!cortesData) return { inteiras: 0, comCorte: 0, total: 0 }
    
    const inteiras = cortesData.cortes.reduce((acc, c) => acc + c.placasInteiras, 0)
    const comCorte = cortesData.cortes.reduce((acc, c) => acc + c.placasComCorte, 0)
    
    return { inteiras, comCorte, total: inteiras + comCorte }
  }

  const totals = getTotals()

  // Função para renderizar SVG de forma segura e responsiva
  const renderSVG = (svgContent: string, containerClass: string = "") => {
    if (!svgContent) return <p className="text-gray-400 text-sm text-center py-4">Sem diagrama</p>
    
    // Limpar e tornar responsivo
    let cleanSvg = svgContent.trim()
    
    // Remover dimensões fixas e adicionar responsivas
    cleanSvg = cleanSvg
      .replace(/width="[^"]*"/g, '')
      .replace(/height="[^"]*"/g, '')
      .replace(/<svg/, '<svg preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;max-height:100%;display:block;"')
    
    return (
      <div 
        className={`w-full flex items-center justify-center ${containerClass}`}
        dangerouslySetInnerHTML={{ __html: cleanSvg }}
      />
    )
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

  if (!cortesData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold mb-4" style={{ color: "#1f2539" }}>
                Nenhum corte para visualizar
              </h2>
              <p className="text-gray-600 mb-6">
                Faça a validação dos dados da planta primeiro para gerar os cortes.
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
      <div className="max-w-7xl mx-auto py-4 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/projetos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: "#1f2539" }}>
                Cortes Gerados
              </h1>
              <p className="text-sm text-gray-600">
                {cortesData.cortes.length} paredes processadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                style={viewMode === "grid" ? { backgroundColor: "#d03034", color: "#fff" } : {}}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                style={viewMode === "list" ? { backgroundColor: "#d03034", color: "#fff" } : {}}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button size="sm" onClick={handleExportPDF} style={{ backgroundColor: "#d03034", color: "#fff" }}>
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">{cortesData.message}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Paredes</p>
              <p className="text-2xl font-bold" style={{ color: "#1f2539" }}>{cortesData.cortes.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Inteiras</p>
              <p className="text-2xl font-bold text-green-600">{totals.inteiras}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Com Corte</p>
              <p className="text-2xl font-bold text-amber-600">{totals.comCorte}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Total Placas</p>
              <p className="text-2xl font-bold" style={{ color: "#d03034" }}>{totals.total}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cuts Display - Grid Mode */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {cortesData.cortes.map((corte, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setExpandedCorte(index)}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{corte.nomeComodo}</p>
                      <CardTitle className="text-base" style={{ color: "#d03034" }}>
                        Parede {corte.identificacao}
                      </CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedCorte(index)
                      }}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {/* SVG Preview */}
                  <div className="bg-gray-50 rounded border mb-2 p-2 h-32 overflow-hidden">
                    {renderSVG(corte.svgCorte)}
                  </div>
                  
                  {/* Info */}
                  <div className="text-xs text-gray-600 mb-2">
                    {corte.comprimento}cm × {corte.altura}cm
                  </div>
                  
                  {/* Badges */}
                  <div className="flex items-center gap-1">
                    <Badge className="text-xs px-2 py-0" style={{ backgroundColor: "#10b981", color: "#fff" }}>
                      {corte.placasInteiras} int
                    </Badge>
                    {corte.placasComCorte > 0 && (
                      <Badge className="text-xs px-2 py-0" style={{ backgroundColor: "#f59e0b", color: "#fff" }}>
                        {corte.placasComCorte} corte
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {corte.totalPlacas} total
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cuts Display - List Mode */}
        {viewMode === "list" && (
          <div className="space-y-3 mb-6">
            {cortesData.cortes.map((corte, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-md hover:shadow-lg transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* SVG Preview */}
                    <div 
                      className="bg-gray-50 rounded border p-3 md:w-72 shrink-0 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setExpandedCorte(index)}
                    >
                      <div className="h-40 overflow-hidden">
                        {renderSVG(corte.svgCorte)}
                      </div>
                      <div className="text-center mt-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Maximize2 className="h-3 w-3 mr-1" />
                          Expandir
                        </Button>
                      </div>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm text-gray-500">{corte.nomeComodo}</p>
                          <h3 className="text-lg font-semibold" style={{ color: "#d03034" }}>
                            Parede {corte.identificacao}
                          </h3>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadSVG(corte, index)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          SVG
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Dimensões</p>
                          <p className="font-medium">{corte.comprimento}cm × {corte.altura}cm</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Placas Inteiras</p>
                          <p className="font-medium text-green-600">{corte.placasInteiras}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Com Corte</p>
                          <p className="font-medium text-amber-600">{corte.placasComCorte}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="font-bold" style={{ color: "#d03034" }}>{corte.totalPlacas}</p>
                        </div>
                      </div>
                      
                      {(corte.sobraLargura > 0 || corte.sobraAltura > 0) && (
                        <div className="mt-3 pt-3 border-t flex gap-4 text-sm">
                          <span className="text-gray-500">
                            Sobra L: <span className="font-medium">{corte.sobraLargura?.toFixed(1)}cm</span>
                          </span>
                          <span className="text-gray-500">
                            Sobra A: <span className="font-medium">{corte.sobraAltura?.toFixed(1)}cm</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg shadow-md p-4">
          <Button variant="outline" onClick={() => router.push('/projetos/validacao')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Validação
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                sessionStorage.removeItem('plantaData')
                sessionStorage.removeItem('cortesData')
                router.push('/projetos')
              }}
            >
              Novo Projeto
            </Button>
            <Button
              className="font-semibold"
              style={{ backgroundColor: "#d03034", color: "#ffffff" }}
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Expanded View Modal */}
        <Dialog open={expandedCorte !== null} onOpenChange={() => { setExpandedCorte(null); setZoom(100); }}>
          <DialogContent className="max-w-[95vw] w-full md:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            {expandedCorte !== null && cortesData.cortes[expandedCorte] && (
              <>
                <DialogHeader className="shrink-0">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                      <span style={{ color: "#d03034" }}>
                        {cortesData.cortes[expandedCorte].nomeComodo} - Parede {cortesData.cortes[expandedCorte].identificacao}
                      </span>
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="text-sm w-12 text-center">{zoom}%</span>
                      <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadSVG(cortesData.cortes[expandedCorte], expandedCorte)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-auto bg-gray-50 rounded-lg border p-4 min-h-0">
                  {cortesData.cortes[expandedCorte].svgCorte ? (
                    <div 
                      className="flex items-center justify-center min-h-[300px]"
                      style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
                    >
                      <div 
                        className="bg-white p-4 rounded shadow-sm"
                        style={{ maxWidth: '100%' }}
                        dangerouslySetInnerHTML={{ 
                          __html: cortesData.cortes[expandedCorte].svgCorte
                            .replace(/<svg/, '<svg style="max-width:100%;height:auto;"')
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-12">Diagrama não disponível</p>
                  )}
                </div>
                
                {/* Info Footer */}
                <div className="shrink-0 pt-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="bg-gray-50 rounded p-2">
                    <span className="text-gray-500">Dimensões:</span>
                    <span className="ml-1 font-medium">
                      {cortesData.cortes[expandedCorte].comprimento}cm × {cortesData.cortes[expandedCorte].altura}cm
                    </span>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <span className="text-green-700">Inteiras:</span>
                    <span className="ml-1 font-bold text-green-600">
                      {cortesData.cortes[expandedCorte].placasInteiras}
                    </span>
                  </div>
                  <div className="bg-amber-50 rounded p-2">
                    <span className="text-amber-700">Com Corte:</span>
                    <span className="ml-1 font-bold text-amber-600">
                      {cortesData.cortes[expandedCorte].placasComCorte}
                    </span>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <span className="text-red-700">Total:</span>
                    <span className="ml-1 font-bold" style={{ color: "#d03034" }}>
                      {cortesData.cortes[expandedCorte].totalPlacas}
                    </span>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
