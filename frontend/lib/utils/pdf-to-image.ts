import * as pdfjsLib from 'pdfjs-dist'

// Configurar worker do PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

/**
 * Converte a primeira página de um PDF para uma imagem Base64 (JPEG)
 * @param file Arquivo PDF
 * @param scale Escala de renderização (1.5 = 150% do tamanho original)
 * @returns Promise com a string Base64 da imagem (sem prefixo data:image/...)
 */
export async function pdfToImage(file: File, scale: number = 2.0): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  // Pegar a primeira página
  const page = await pdf.getPage(1)
  
  // Calcular dimensões
  const viewport = page.getViewport({ scale })
  
  // Criar canvas
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  if (!context) {
    throw new Error('Não foi possível criar contexto 2D')
  }
  
  canvas.width = viewport.width
  canvas.height = viewport.height
  
  // Renderizar a página no canvas
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise
  
  // Converter para Base64 JPEG
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
  
  // Remover o prefixo "data:image/jpeg;base64," para retornar apenas o Base64
  const base64 = dataUrl.split(',')[1]
  
  return base64
}

/**
 * Verifica se um arquivo é PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

/**
 * Converte um arquivo para Base64
 * Se for PDF, converte para imagem primeiro
 * Se já for imagem, retorna o Base64 direto
 */
export async function fileToImageBase64(file: File): Promise<string> {
  if (isPDF(file)) {
    return pdfToImage(file)
  }
  
  // Se já é uma imagem, converter diretamente para Base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remover o prefixo data:image/...;base64,
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}


