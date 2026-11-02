"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Download,
  ZoomIn,
  ZoomOut,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers,
  LayoutGrid,
  Box,
  Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { type PlantaData } from "@/lib/services/ai-service"
import { 
  gerarSvgsCorte, 
  calcularCortesLocal, 
  type DadosParede, 
  type SvgCorteResult,
  type CalculoCorte,
  type PainelSvg
} from "@/lib/utils/svg-corte-generator"

interface ParedeCortes {
  identificacaoParede: string
  nomeComodo: string
  comprimento: number
  altura: number
  calculo: CalculoCorte
  svgs: SvgCorteResult
}

interface ComodoGroup {
  nomeComodo: string
  paredes: ParedeCortes[]
}

export default function CortesLocalPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [plantaData, setPlantaData] = useState<PlantaData | null>(null)
  const [paredesCortes, setParedesCortes] = useState<ParedeCortes[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSvg, setExpandedSvg] = useState<{ svg: string; title: string } | null>(null)
  const [zoom, setZoom] = useState(100)
  const [selectedComodo, setSelectedComodo] = useState<string>("")
  const [expandedPainel, setExpandedPainel] = useState<{ paredeId: string; painelIdx: number } | null>(null)

  const comodoGroups = useMemo<ComodoGroup[]>(() => {
    const groups: { [key: string]: ParedeCortes[] } = {}
    paredesCortes.forEach(p => {
      if (!groups[p.nomeComodo]) groups[p.nomeComodo] = []
      groups[p.nomeComodo].push(p)
    })
    return Object.entries(groups).map(([nomeComodo, paredes]) => ({ nomeComodo, paredes }))
  }, [paredesCortes])

  useEffect(() => { loadAndGenerateCortes() }, [])

  useEffect(() => {
    if (comodoGroups.length > 0 && !selectedComodo) {
      setSelectedComodo(comodoGroups[0].nomeComodo)
    }
  }, [comodoGroups, selectedComodo])

  const loadAndGenerateCortes = async () => {
    try {
      const storedPlanta = sessionStorage.getItem('plantaData')
      const storedCalculos = sessionStorage.getItem('calculosData')
      
      if (!storedPlanta) {
        toast({ title: "Erro", description: "Dados não encontrados.", variant: "destructive" })
        router.push('/projetos')
        return
      }

      const planta: PlantaData = JSON.parse(storedPlanta)
      setPlantaData(planta)
      
      // Dados de cálculo do backend (se disponíveis)
      let calculosBackend: any = null
      if (storedCalculos) {
        try {
          calculosBackend = JSON.parse(storedCalculos)
        } catch (e) {
          console.warn('Erro ao parsear calculosData:', e)
        }
      }

      const cortes: ParedeCortes[] = []
      for (const comodo of planta.comodos) {
        for (const parede of comodo.paredes) {
          // Tenta usar o cálculo do backend primeiro
          let calculo = null
          
          if (calculosBackend?.comodosCalculados) {
            const comodoCalc = calculosBackend.comodosCalculados.find(
              (c: any) => c.nomeComodo === comodo.nomeComodo
            )
            if (comodoCalc) {
              const paredeCalc = comodoCalc.paredes.find(
                (p: any) => p.identificador === parede.identificacaoParede
              )
              if (paredeCalc) {
                calculo = {
                  identificador: paredeCalc.identificador,
                  placasInteiras: paredeCalc.placasInteiras || 0,
                  qtdPlacasCorteComprimento: paredeCalc.qtdPlacasCorteComprimento || 0,
                  placaCorteComprimento: paredeCalc.placaCorteComprimento,
                  qtdPlacasCorteAltura: paredeCalc.qtdPlacasCorteAltura || 0,
                  placaCorteAltura: paredeCalc.placaCorteAltura,
                  qtdPlacaCorteAlturaEComprimento: paredeCalc.qtdPlacaCorteAlturaEComprimento || 0,
                  placaCorteAlturaEComprimento: paredeCalc.placaCorteAlturaEComprimento || [],
                  placaCorteAlturaEComprimentoPosicaoY: paredeCalc.placaCorteAlturaEComprimentoPosicaoY || null,
                  totalPlacas: paredeCalc.totalPlacas || 0,
                }
              }
            }
          }
          
          // Se não encontrou no backend, calcula localmente
          if (!calculo) {
            calculo = calcularCortesLocal(parede.identificacaoParede, parede.comprimento, parede.altura)
          }
          
          // Pegar portas e janelas do plantaData original
          const portas = (parede as any).portas || []
          const janelas = (parede as any).janelas || []
          
          // Debug: verificar se portas/janelas estão sendo passadas
          if (portas.length > 0 || janelas.length > 0) {
            console.log(`[DEBUG] Parede ${parede.identificacaoParede}:`, { portas, janelas })
          }
          
          const dadosParede: DadosParede = {
            identificacaoParede: parede.identificacaoParede,
            nomeComodo: comodo.nomeComodo,
            comprimento: parede.comprimento,
            altura: parede.altura,
            calculo,
            portas,
            janelas,
          }
          const svgs = gerarSvgsCorte(dadosParede)
          cortes.push({ ...dadosParede, svgs })
        }
      }

      setParedesCortes(cortes)
      toast({ title: "Pronto!", description: `${cortes.length} paredes processadas.` })
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao gerar cortes.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const downloadSvg = (svg: string, filename: string) => {
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAllPaineis = () => {
    paredesCortes.forEach((parede) => {
      // Download montagem
      downloadSvg(parede.svgs.svgMontagem, `${parede.nomeComodo}_${parede.identificacaoParede}_montagem.svg`)
      // Download painéis
      parede.svgs.paineis.forEach((painel) => {
        setTimeout(() => {
          downloadSvg(painel.svg, `${parede.nomeComodo}_${parede.identificacaoParede}_painel${painel.numeroPainel}.svg`)
        }, 100)
      })
    })
    toast({ title: "Download iniciado", description: "Todos os arquivos estão sendo baixados." })
  }

  const getTotals = () => {
    let totalPaineis = 0
    let paineisInteiros = 0
    let paineisComCorte = 0
    
    paredesCortes.forEach(p => {
      p.svgs.paineis.forEach(painel => {
        totalPaineis++
        if (painel.temCorte) paineisComCorte++
        else paineisInteiros++
      })
    })
    
    return {
      comodos: comodoGroups.length,
      paredes: paredesCortes.length,
      paineis: totalPaineis,
      inteiros: paineisInteiros,
      comCorte: paineisComCorte,
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#d03034]"></div>
          <p className="text-muted-foreground">Gerando cortes...</p>
        </div>
      </DashboardLayout>
    )
  }

  const totals = getTotals()
  const currentGroup = comodoGroups.find(g => g.nomeComodo === selectedComodo)

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => router.push('/projetos/validacao-calculos')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{plantaData?.nome || 'Cortes SpeedFormas'}</h1>
              <p className="text-sm text-muted-foreground">
                {totals.paredes} paredes • {totals.paineis} painéis ({totals.inteiros} inteiros, {totals.comCorte} com corte)
              </p>
            </div>
          </div>
          
          <Button onClick={downloadAllPaineis} className="bg-[#d03034] hover:bg-[#b02028]">
            <Download className="h-4 w-4 mr-2" />
            Baixar Tudo
          </Button>
        </div>

        {/* Abas de Cômodos */}
        <Tabs value={selectedComodo} onValueChange={setSelectedComodo} className="w-full">
          <div className="border-b">
            <ScrollArea className="w-full pb-px">
              <nav className="flex gap-1" aria-label="Tabs">
                {comodoGroups.map((group) => {
                  const isActive = selectedComodo === group.nomeComodo
                  const totalPaineis = group.paredes.reduce((acc, p) => acc + p.svgs.paineis.length, 0)
                  return (
                    <button
                      key={group.nomeComodo}
                      onClick={() => setSelectedComodo(group.nomeComodo)}
                      className={`
                        relative flex items-center gap-2 px-4 py-3 text-sm font-medium
                        transition-colors duration-200 whitespace-nowrap
                        ${isActive ? 'text-[#d03034]' : 'text-muted-foreground hover:text-foreground'}
                      `}
                    >
                      <Home className="h-4 w-4" />
                      {group.nomeComodo}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#d03034]/10 text-[#d03034]' : 'bg-muted'}`}>
                        {group.paredes.length} paredes • {totalPaineis} painéis
                      </span>
                      {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d03034] rounded-t-full" />}
                    </button>
                  )
                })}
              </nav>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Conteúdo do Cômodo */}
          {currentGroup && (
            <TabsContent value={currentGroup.nomeComodo} className="pt-6 space-y-8">
              {currentGroup.paredes.map((parede) => (
                <Card key={parede.identificacaoParede} className="overflow-hidden">
                  {/* Header da Parede */}
                  <CardHeader className="bg-[#1f2539] text-white py-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Parede {parede.identificacaoParede}</CardTitle>
                          <p className="text-sm text-white/70">
                            {(parede.comprimento * 100).toFixed(0)} × {(parede.altura * 100).toFixed(0)} cm
                            <span className="mx-2">•</span>
                            {parede.svgs.paineis.length} painéis
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => downloadSvg(parede.svgs.svgMontagem, `${parede.nomeComodo}_${parede.identificacaoParede}_montagem.svg`)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Montagem
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* SEÇÃO 1: Vista de Montagem */}
                    <div className="p-4 border-b bg-slate-50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4 text-[#d03034]" />
                          Vista de Montagem
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedSvg({
                            svg: parede.svgs.svgMontagem,
                            title: `Montagem - ${parede.nomeComodo} ${parede.identificacaoParede}`
                          })}
                        >
                          <ZoomIn className="h-4 w-4 mr-1" />
                          Expandir
                        </Button>
                      </div>
                      <div className="bg-white rounded-lg border overflow-hidden max-w-2xl mx-auto">
                        <div dangerouslySetInnerHTML={{ __html: parede.svgs.svgMontagem }} />
                      </div>
                    </div>

                    {/* SEÇÃO 2: Painéis Individuais */}
                    <div className="p-4">
                      <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                        <Box className="h-4 w-4 text-[#d03034]" />
                        Cortes por Painel
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          (Clique para ver detalhes)
                        </span>
                      </h3>

                      {/* Grid de Painéis */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {parede.svgs.paineis.map((painel, idx) => {
                          const isExpanded = expandedPainel?.paredeId === parede.identificacaoParede && expandedPainel?.painelIdx === idx
                          return (
                            <button
                              key={painel.numeroPainel}
                              onClick={() => setExpandedPainel(isExpanded ? null : { paredeId: parede.identificacaoParede, painelIdx: idx })}
                              className={`
                                relative p-3 rounded-lg border-2 text-left transition-all
                                ${isExpanded 
                                  ? 'border-[#d03034] bg-[#d03034]/5 ring-2 ring-[#d03034]/20' 
                                  : 'border-border hover:border-[#d03034]/50 bg-background'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`
                                  w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                                  ${isExpanded ? 'bg-[#d03034] text-white' : 'bg-muted'}
                                `}>
                                  {painel.numeroPainel}
                                </span>
                                {painel.temCorte && (
                                  <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5">corte</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {painel.largura} × {painel.altura} cm
                              </p>
                              {isExpanded && (
                                <Eye className="absolute top-2 right-2 h-4 w-4 text-[#d03034]" />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Painel Expandido */}
                      {expandedPainel?.paredeId === parede.identificacaoParede && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg border animate-fade-in">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">
                                Painel {parede.svgs.paineis[expandedPainel.painelIdx].numeroPainel}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {parede.svgs.paineis[expandedPainel.painelIdx].largura} × {parede.svgs.paineis[expandedPainel.painelIdx].altura} cm
                                {parede.svgs.paineis[expandedPainel.painelIdx].temCorte && ' • Requer corte'}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpandedSvg({
                                  svg: parede.svgs.paineis[expandedPainel.painelIdx].svg,
                                  title: `Painel ${parede.svgs.paineis[expandedPainel.painelIdx].numeroPainel} - ${parede.nomeComodo} ${parede.identificacaoParede}`
                                })}
                              >
                                <ZoomIn className="h-4 w-4 mr-1" />
                                Tela Cheia
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadSvg(
                                  parede.svgs.paineis[expandedPainel.painelIdx].svg,
                                  `${parede.nomeComodo}_${parede.identificacaoParede}_painel${parede.svgs.paineis[expandedPainel.painelIdx].numeroPainel}.svg`
                                )}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Baixar
                              </Button>
                            </div>
                          </div>

                          {/* Navegação entre painéis */}
                          <div className="flex items-center gap-2 mb-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={expandedPainel.painelIdx === 0}
                              onClick={() => setExpandedPainel({ ...expandedPainel, painelIdx: expandedPainel.painelIdx - 1 })}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              {expandedPainel.painelIdx + 1} de {parede.svgs.paineis.length}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={expandedPainel.painelIdx === parede.svgs.paineis.length - 1}
                              onClick={() => setExpandedPainel({ ...expandedPainel, painelIdx: expandedPainel.painelIdx + 1 })}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* SVG do Painel */}
                          <div className="bg-white rounded-lg border overflow-hidden">
                            <div dangerouslySetInnerHTML={{ __html: parede.svgs.paineis[expandedPainel.painelIdx].svg }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modal Expandido */}
      {expandedSvg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{expandedSvg.title}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={() => { setExpandedSvg(null); setZoom(100) }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                dangerouslySetInnerHTML={{ __html: expandedSvg.svg }}
              />
            </ScrollArea>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
