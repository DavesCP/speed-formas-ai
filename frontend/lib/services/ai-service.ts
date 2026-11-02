import { config } from "@/lib/config"

export interface AIProcessingRequest {
  architecturalFile?: File
  structuralFile: File
  electricalFile?: File
  projectName: string
  projectDescription?: string
  additionalNotes?: string
}

export interface PlantaData {
  nome: string
  unidadeMedida: string
  comodos: ComodoData[]
}

export interface ComodoData {
  nomeComodo: string
  paredes: ParedeData[]
}

export interface PortaData {
  altura: number
  comprimento: number
  posicaoX: number
  posicaoY: number
}

export interface JanelaData {
  altura: number
  comprimento: number
  posicaoX: number
  posicaoY: number
  posicaoSolo: number
}

export interface ParedeData {
  identificacaoParede: string
  comprimento: number
  altura: number
  largura: number
  quantidadeLP: number
  portas?: PortaData[]
  janelas?: JanelaData[]
  elementosInternos?: ElementoInternoData[]
}

export interface ElementoInternoData {
  tipo: string
  identificacao: string
  comprimento: number
  altura: number
  largura: number
  quantidadeLP?: number
}

export interface AIProcessingResponse {
  success: boolean
  projectId: string
  status: "processing" | "completed" | "error"
  message: string
  plantaData?: PlantaData
  estimatedTimeMinutes?: number
}

export interface CorteImagem {
  identificacao: string
  nomeComodo: string
  comprimento: number
  altura: number
  placasInteiras: number
  placasComCorte: number
  svgCorte: string
  sobraLargura: number
  sobraAltura: number
  totalPlacas: number
}

export interface GerarCortesResponse {
  success: boolean
  message: string
  cortes: CorteImagem[]
}

// Função para processar arquivos com o backend
const processFilesWithBackend = async (request: AIProcessingRequest): Promise<AIProcessingResponse> => {
  const formData = new FormData()
  
  // Arquivo obrigatório
  formData.append("structuralFile", request.structuralFile)
  
  // Arquivos opcionais
  if (request.architecturalFile) {
    formData.append("architecturalFile", request.architecturalFile)
  }
  if (request.electricalFile) {
    formData.append("electricalFile", request.electricalFile)
  }
  
  // Informações do projeto
  formData.append("projectName", request.projectName)
  if (request.projectDescription) {
    formData.append("projectDescription", request.projectDescription)
  }
  if (request.additionalNotes) {
    formData.append("additionalNotes", request.additionalNotes)
  }

  try {
    console.log("🚀 Enviando para Backend API:", config.apiUrl)
    console.log("📁 Arquivo:", request.structuralFile.name, request.structuralFile.size, "bytes")
    
    const response = await fetch(`${config.apiUrl}/ia/analisar-planta`, {
      method: "POST",
      body: formData,
      // Não definir Content-Type - o browser define automaticamente com boundary
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro da API:", errorText)
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ Resposta Backend:", result)
    
    return {
      success: result.success,
      projectId: result.projectId || `proj_${Date.now()}`,
      status: result.status || "completed",
      message: result.message || "Análise concluída",
      plantaData: result.plantaData,
    }
  } catch (error) {
    console.error("❌ Erro na integração com Backend:", error)
    return {
      success: false,
      projectId: "",
      status: "error",
      message: `Erro na comunicação com o servidor: ${error instanceof Error ? error.message : error}`,
    }
  }
}

// Função para gerar cortes
// useIA: true = usa Gemini AI para gerar SVGs, false = usa geração programática (padrão SpeedFormas)
const generateCutsWithBackend = async (plantaData: PlantaData, useIA: boolean = false): Promise<GerarCortesResponse> => {
  try {
    const metodo = useIA ? "IA" : "padrão"
    console.log(`🚀 Enviando para geração de cortes (${metodo})...`)
    
    const url = `${config.apiUrl}/ia/gerar-cortes?useIA=${useIA}`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plantaData),
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro da API:", errorText)
      throw new Error(`API Error ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log("✅ Cortes gerados:", result)
    
    return result
  } catch (error) {
    console.error("❌ Erro ao gerar cortes:", error)
    return {
      success: false,
      message: `Erro ao gerar cortes: ${error instanceof Error ? error.message : error}`,
      cortes: [],
    }
  }
}

// Mock para desenvolvimento
const mockProcessFiles = async (request: AIProcessingRequest): Promise<AIProcessingResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return {
    success: true,
    projectId: `proj_${Date.now()}`,
    status: "completed",
    message: "Análise concluída com sucesso!",
    plantaData: {
      nome: request.projectName,
      unidadeMedida: "cm",
      comodos: [
        {
          nomeComodo: "SALA",
          paredes: [
            {
              identificacaoParede: "p1",
              comprimento: 400,
              altura: 280,
              largura: 14,
              quantidadeLP: 2,
            },
            {
              identificacaoParede: "p2",
              comprimento: 350,
              altura: 280,
              largura: 14,
              quantidadeLP: 1,
            },
          ],
        },
        {
          nomeComodo: "COZINHA",
          paredes: [
            {
              identificacaoParede: "p3",
              comprimento: 300,
              altura: 280,
              largura: 14,
              quantidadeLP: 3,
            },
          ],
        },
      ],
    },
  }
}

const mockGenerateCuts = async (plantaData: PlantaData): Promise<GerarCortesResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const cortes: CorteImagem[] = []
  
  for (const comodo of plantaData.comodos) {
    for (const parede of comodo.paredes) {
      const placasInteiras = Math.floor((parede.comprimento / 100) / 1.1)
      const sobra = (parede.comprimento / 100) % 1.1
      
      cortes.push({
        identificacao: parede.identificacaoParede,
        nomeComodo: comodo.nomeComodo,
        comprimento: parede.comprimento,
        altura: parede.altura,
        placasInteiras: placasInteiras,
        placasComCorte: sobra > 0.1 ? 1 : 0,
        svgCorte: `<svg viewBox="0 0 400 300"><rect fill="#ADD8E6" width="100" height="200"/></svg>`,
        sobraLargura: sobra * 100,
        sobraAltura: 0,
        totalPlacas: placasInteiras + (sobra > 0.1 ? 1 : 0),
      })
    }
  }

  return {
    success: true,
    message: `Cortes gerados para ${cortes.length} paredes`,
    cortes,
  }
}

// Exporta as funções baseadas na configuração
export const aiService = {
  processFiles: (request: AIProcessingRequest) =>
    config.useMock ? mockProcessFiles(request) : processFilesWithBackend(request),

  // useIA: true = Gemini AI gera SVGs, false = geração programática padrão SpeedFormas
  generateCuts: (plantaData: PlantaData, useIA: boolean = false) =>
    config.useMock ? mockGenerateCuts(plantaData) : generateCutsWithBackend(plantaData, useIA),
}

// Função auxiliar para polling de status (se necessário no futuro)
export const waitForCompletion = async (
  projectId: string,
  onProgress?: (response: AIProcessingResponse) => void,
  maxAttempts: number = 30,
  intervalMs: number = 10000
): Promise<AIProcessingResponse> => {
  // Por enquanto, retorna direto pois o processamento é síncrono
  return {
    success: true,
    projectId,
    status: "completed",
    message: "Processamento concluído",
  }
}
