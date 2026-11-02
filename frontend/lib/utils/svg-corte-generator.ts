/**
 * Gerador de SVG para cortes de placas - SpeedFormas
 * Mostra a placa INTEIRA (110x220) com linhas de corte tracejadas
 * 
 * Dimensões padrão da placa: 110cm x 220cm
 */

export const PLACA_LARGURA = 110 // cm
export const PLACA_ALTURA = 220 // cm

export interface RecorteDTO {
  largura: number
  altura: number
  posicaoX: number
  posicaoY: number
}

export interface PlacaComRecorteDTO {
  numeroPlaca: number
  larguraPlaca: number
  alturaPlaca: number
  recortes: RecorteDTO[]
}

export interface PlacaCorteAlturaEComprimentoPosicaoY {
  qtdPlacas: number
  placas: PlacaComRecorteDTO[]
}

export interface CalculoCorte {
  identificador: string
  placasInteiras: number
  qtdPlacasCorteComprimento: number
  placaCorteComprimento: { altura: number; comprimento: number } | null
  qtdPlacasCorteAltura: number
  placaCorteAltura: { altura: number; comprimento: number } | null
  qtdPlacaCorteAlturaEComprimento: number
  placaCorteAlturaEComprimento: { altura: number; comprimento: number }[]
  placaCorteAlturaEComprimentoPosicaoY?: PlacaCorteAlturaEComprimentoPosicaoY | null
  totalPlacas: number
}

export interface PortaParede {
  altura: number
  comprimento: number
  posicaoX: number
  posicaoY: number
}

export interface JanelaParede {
  altura: number
  comprimento: number
  posicaoX: number
  posicaoY: number
  posicaoSolo: number
}

export interface DadosParede {
  identificacaoParede: string
  nomeComodo: string
  comprimento: number
  altura: number
  calculo: CalculoCorte
  portas?: PortaParede[]
  janelas?: JanelaParede[]
}

export interface PainelCorte {
  numeroPainel: number
  larguraFinal: number // cm - tamanho final após corte
  alturaFinal: number  // cm - tamanho final após corte
  temCorte: boolean
  corteLargura: boolean // precisa cortar na largura
  corteAltura: boolean  // precisa cortar na altura
  recortes?: RecorteDTO[] // recortes internos (portas/janelas)
}

export interface SvgCorteResult {
  svgPlacaInterna: string
  svgPlacaExterna: string
  svgEps: string
  svgMontagem: string
  svgPadraoSpeedFormas: string
  paineis: PainelSvg[]
}

export interface PainelSvg {
  numeroPainel: number
  largura: number
  altura: number
  temCorte: boolean
  svg: string
}

const mToCm = (m: number): number => m * 100

// Cores do design
const CORES = {
  fundoPlaca: '#e8d4a8',      // Madeirite
  fundoEps: '#f0f0f0',        // EPS cinza claro
  corte: '#dc2626',           // Vermelho para linha de corte
  contorno: '#1f2539',        // Azul escuro SpeedForma
  texto: '#1f2539',
  header: '#1f2539',
  descarte: '#fecaca',        // Área de descarte (vermelho claro)
  montagemInterno: '#166534', // Verde escuro
  montagemExterno: '#1e40af', // Azul escuro
  montagemCorte: '#dc2626',   // Vermelho para painéis com corte
}

/**
 * Gera SVG para UM painel - Estilo técnico AutoCAD
 * Mostra a placa INTEIRA com linha de corte tracejada
 */
function gerarSvgPainelSpeedFormas(
  painel: PainelCorte,
  dados: DadosParede
): string {
  const { larguraFinal, alturaFinal, numeroPainel, temCorte, corteLargura, corteAltura } = painel
  
  const svgW = 950
  const svgH = 550
  const headerH = 50
  const footerH = 55
  const margin = 25
  const colGap = 20
  
  // Cores estilo técnico
  const corFundo = '#ffffff'
  const corLinha = '#2c3e50'
  const corMadeirite = '#f5e6c8'
  const corEps = '#f0f0f0'
  const corCorte = '#c0392b'
  const corDescarte = '#fadbd8'
  const corUtil = '#1e8449'
  const corCota = '#555555'
  const corTexto = '#1a1a1a'
  
  // 4 colunas
  const colW = (svgW - margin * 2 - colGap * 3) / 4
  const areaH = svgH - headerH - footerH - 30
  
  // Escala para a placa INTEIRA caber na área
  const scaleW = (colW - 40) / PLACA_LARGURA
  const scaleH = (areaH - 60) / PLACA_ALTURA
  const scale = Math.min(scaleW, scaleH)
  
  const placaW = PLACA_LARGURA * scale
  const placaH = PLACA_ALTURA * scale
  
  // Posição do corte
  const corteX = larguraFinal * scale
  const corteY = (PLACA_ALTURA - alturaFinal) * scale
  
  let svg = ''
  
  // Fundo branco com grid
  svg += `<rect width="100%" height="100%" fill="${corFundo}"/>`
  for (let gx = 0; gx < svgW; gx += 15) {
    svg += `<line x1="${gx}" y1="0" x2="${gx}" y2="${svgH}" stroke="#f5f5f5" stroke-width="0.5"/>`
  }
  for (let gy = 0; gy < svgH; gy += 15) {
    svg += `<line x1="0" y1="${gy}" x2="${svgW}" y2="${gy}" stroke="#f5f5f5" stroke-width="0.5"/>`
  }
  
  // Header técnico
  svg += `<line x1="0" y1="${headerH}" x2="${svgW}" y2="${headerH}" stroke="${corLinha}" stroke-width="1"/>`
  
  // Carimbo esquerdo
  svg += `<text x="15" y="20" font-size="12" font-weight="bold" fill="${corTexto}" font-family="monospace">CORTE PAINEL P${numeroPainel}</text>`
  svg += `<text x="15" y="35" font-size="9" fill="${corCota}" font-family="monospace">${dados.nomeComodo} | Parede ${dados.identificacaoParede}</text>`
  
  // Status do corte
  if (temCorte) {
    svg += `<rect x="${svgW/2 - 80}" y="10" width="160" height="28" fill="${corDescarte}" stroke="${corCorte}" stroke-width="1" rx="3"/>`
    svg += `<text x="${svgW/2}" y="28" text-anchor="middle" font-size="10" font-weight="bold" fill="${corCorte}" font-family="monospace">CORTAR: ${larguraFinal} × ${alturaFinal} cm</text>`
  } else {
    svg += `<rect x="${svgW/2 - 80}" y="10" width="160" height="28" fill="#e8f8e8" stroke="${corUtil}" stroke-width="1" rx="3"/>`
    svg += `<text x="${svgW/2}" y="28" text-anchor="middle" font-size="10" font-weight="bold" fill="${corUtil}" font-family="monospace">PLACA INTEIRA</text>`
  }
  
  // Carimbo direito (logo)
  svg += `<rect x="${svgW - 120}" y="8" width="110" height="35" fill="none" stroke="${corLinha}" stroke-width="1"/>`
  svg += `<text x="${svgW - 65}" y="22" text-anchor="middle" font-size="9" font-weight="bold" fill="#d03034" font-family="monospace">SPEEDFORMAS</text>`
  svg += `<text x="${svgW - 65}" y="36" text-anchor="middle" font-size="7" fill="${corCota}" font-family="monospace">ESC: 1:${Math.round(1/scale * 5)}</text>`
  
  // 4 colunas
  const colunas = [
    { titulo: 'CHAPA INTERNA', tipo: 'madeirite' },
    { titulo: 'CHAPA EXTERNA', tipo: 'madeirite' },
    { titulo: 'EPS', tipo: 'eps' },
    { titulo: 'MONTAGEM', tipo: 'montada' },
  ]
  
  colunas.forEach((col, idx) => {
    const colX = margin + idx * (colW + colGap)
    const placaX = colX + (colW - placaW) / 2
    const placaY = headerH + 35 + (areaH - 50 - placaH) / 2
    
    // Título da coluna (estilo técnico)
    svg += `<rect x="${colX}" y="${headerH + 8}" width="${colW}" height="18" fill="#f8f9fa" stroke="${corLinha}" stroke-width="0.5"/>`
    svg += `<text x="${colX + colW/2}" y="${headerH + 20}" fill="${corTexto}" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">${col.titulo}</text>`
    
    if (col.tipo === 'montada') {
      // Vista de montagem isométrica simplificada
      const offset = 8
      
      // Sombra
      svg += `<rect x="${placaX + offset * 2 + 3}" y="${placaY + 3}" width="${placaW - offset * 2}" height="${placaH}" fill="#ddd" rx="1"/>`
      
      // EPS (fundo)
      svg += `<rect x="${placaX + offset * 2}" y="${placaY}" width="${placaW - offset * 2}" height="${placaH}" fill="${corEps}" stroke="${corLinha}" stroke-width="1"/>`
      // Chapa externa
      svg += `<rect x="${placaX + offset}" y="${placaY + offset/2}" width="${placaW - offset}" height="${placaH - offset}" fill="#e0e0e0" stroke="${corLinha}" stroke-width="1"/>`
      // Chapa interna
      svg += `<rect x="${placaX}" y="${placaY + offset}" width="${placaW - offset}" height="${placaH - offset * 2}" fill="${corMadeirite}" stroke="${corLinha}" stroke-width="1.5"/>`
      
      // Linhas diagonais (estilo planta)
      svg += `<line x1="${placaX}" y1="${placaY + offset}" x2="${placaX + placaW - offset}" y2="${placaY + placaH - offset}" stroke="${corLinha}" stroke-width="0.3" opacity="0.3"/>`
      svg += `<line x1="${placaX + placaW - offset}" y1="${placaY + offset}" x2="${placaX}" y2="${placaY + placaH - offset}" stroke="${corLinha}" stroke-width="0.3" opacity="0.3"/>`
      
      // Tag do painel
      const tagW = 32
      const tagH = 18
      const tagX = placaX + (placaW - offset)/2 - tagW/2
      const tagY = placaY + (placaH)/2 - tagH/2
      svg += `<rect x="${tagX}" y="${tagY}" width="${tagW}" height="${tagH}" fill="#fff" stroke="${corLinha}" stroke-width="1.5"/>`
      svg += `<text x="${tagX + tagW/2}" y="${tagY + tagH/2 + 4}" text-anchor="middle" font-size="11" font-weight="bold" fill="${corTexto}" font-family="monospace">P${numeroPainel}</text>`
      
    } else {
      // Placa individual (Interna, Externa, EPS)
      const corPlaca = col.tipo === 'eps' ? corEps : corMadeirite
      
      // Placa INTEIRA
      svg += `<rect x="${placaX}" y="${placaY}" width="${placaW}" height="${placaH}" fill="${corPlaca}" stroke="${corLinha}" stroke-width="1.5"/>`
      
      // Hachura para EPS
      if (col.tipo === 'eps') {
        for (let gy = placaY + 12; gy < placaY + placaH; gy += 12) {
          svg += `<line x1="${placaX + 2}" y1="${gy}" x2="${placaX + placaW - 2}" y2="${gy}" stroke="#ccc" stroke-width="0.5"/>`
        }
        for (let gx = placaX + 12; gx < placaX + placaW; gx += 12) {
          svg += `<line x1="${gx}" y1="${placaY + 2}" x2="${gx}" y2="${placaY + placaH - 2}" stroke="#ccc" stroke-width="0.5"/>`
        }
      }
      
      if (temCorte) {
        // 1. Área de descarte (fundo rosa claro)
        if (corteLargura) {
          svg += `<rect x="${placaX + corteX}" y="${placaY}" width="${placaW - corteX}" height="${placaH}" fill="${corDescarte}"/>`
        }
        if (corteAltura) {
          svg += `<rect x="${placaX}" y="${placaY}" width="${corteLargura ? corteX : placaW}" height="${corteY}" fill="${corDescarte}"/>`
        }
        
        // 2. Área útil destacada (borda verde)
        const utilX = placaX
        const utilY = placaY + (corteAltura ? corteY : 0)
        const utilW = corteLargura ? corteX : placaW
        const utilH = corteAltura ? (placaH - corteY) : placaH
        
        // Linhas diagonais na área útil
        svg += `<line x1="${utilX}" y1="${utilY}" x2="${utilX + utilW}" y2="${utilY + utilH}" stroke="${corUtil}" stroke-width="0.5" opacity="0.4"/>`
        svg += `<line x1="${utilX + utilW}" y1="${utilY}" x2="${utilX}" y2="${utilY + utilH}" stroke="${corUtil}" stroke-width="0.5" opacity="0.4"/>`
        
        // Borda da área útil
        svg += `<rect x="${utilX}" y="${utilY}" width="${utilW}" height="${utilH}" fill="none" stroke="${corUtil}" stroke-width="2.5"/>`
        
        // Tag USAR
        const tagW = 36
        const tagH = 14
        svg += `<rect x="${utilX + utilW/2 - tagW/2}" y="${utilY + utilH/2 - tagH/2}" width="${tagW}" height="${tagH}" fill="#fff" stroke="${corUtil}" stroke-width="1"/>`
        svg += `<text x="${utilX + utilW/2}" y="${utilY + utilH/2 + 4}" fill="${corUtil}" font-size="8" font-weight="bold" text-anchor="middle" font-family="monospace">USAR</text>`
        
        // 3. LINHAS DE CORTE TRACEJADAS VERMELHAS (por cima de tudo)
        if (corteLargura) {
          // Linha vertical de corte - VERMELHO TRACEJADO GROSSO
          svg += `<line x1="${placaX + corteX}" y1="${placaY - 10}" x2="${placaX + corteX}" y2="${placaY + placaH + 10}" stroke="#FF0000" stroke-width="3" stroke-dasharray="12,6"/>`
          
          // Marcador de corte no topo
          svg += `<polygon points="${placaX + corteX - 8},${placaY - 12} ${placaX + corteX + 8},${placaY - 12} ${placaX + corteX},${placaY - 4}" fill="#FF0000"/>`
          
          // Cota da largura de corte
          const cotaY1 = placaY + placaH + 18
          svg += `<line x1="${placaX}" y1="${cotaY1}" x2="${placaX + corteX}" y2="${cotaY1}" stroke="#FF0000" stroke-width="1.5"/>`
          svg += `<line x1="${placaX}" y1="${cotaY1 - 5}" x2="${placaX}" y2="${cotaY1 + 5}" stroke="#FF0000" stroke-width="1.5"/>`
          svg += `<line x1="${placaX + corteX}" y1="${cotaY1 - 5}" x2="${placaX + corteX}" y2="${cotaY1 + 5}" stroke="#FF0000" stroke-width="1.5"/>`
          svg += `<rect x="${placaX + corteX/2 - 20}" y="${cotaY1 + 3}" width="40" height="14" fill="#FF0000" rx="2"/>`
          svg += `<text x="${placaX + corteX/2}" y="${cotaY1 + 13}" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">${larguraFinal}</text>`
        }
        
        if (corteAltura) {
          // Linha horizontal de corte - VERMELHO TRACEJADO GROSSO
          svg += `<line x1="${placaX - 10}" y1="${placaY + corteY}" x2="${placaX + placaW + 10}" y2="${placaY + corteY}" stroke="#FF0000" stroke-width="3" stroke-dasharray="12,6"/>`
          
          // Marcador de corte na esquerda
          svg += `<polygon points="${placaX - 12},${placaY + corteY - 8} ${placaX - 12},${placaY + corteY + 8} ${placaX - 4},${placaY + corteY}" fill="#FF0000"/>`
          
          // Cota da altura de corte
          const cotaX1 = placaX - 18
          const utilYStart = placaY + corteY
          svg += `<line x1="${cotaX1}" y1="${utilYStart}" x2="${cotaX1}" y2="${placaY + placaH}" stroke="#FF0000" stroke-width="1.5"/>`
          svg += `<line x1="${cotaX1 - 5}" y1="${utilYStart}" x2="${cotaX1 + 5}" y2="${utilYStart}" stroke="#FF0000" stroke-width="1.5"/>`
          svg += `<line x1="${cotaX1 - 5}" y1="${placaY + placaH}" x2="${cotaX1 + 5}" y2="${placaY + placaH}" stroke="#FF0000" stroke-width="1.5"/>`
          svg += `<rect x="${cotaX1 - 25}" y="${utilYStart + (placaH - corteY)/2 - 7}" width="25" height="14" fill="#FF0000" rx="2"/>`
          svg += `<text x="${cotaX1 - 12}" y="${utilYStart + (placaH - corteY)/2 + 4}" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle" font-family="monospace">${alturaFinal}</text>`
        }
        
        // 4. Tags SOBRA em TODAS as áreas de descarte
        if (corteLargura) {
          // Sobra à direita (corte na largura)
          const descarteX = placaX + corteX + (placaW - corteX) / 2
          const descarteY = placaY + (corteAltura ? corteY : 0) + (corteAltura ? (placaH - corteY) : placaH) / 2
          svg += `<rect x="${descarteX - 28}" y="${descarteY - 9}" width="56" height="18" fill="#FF0000" rx="2"/>`
          svg += `<text x="${descarteX}" y="${descarteY + 4}" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">SOBRA</text>`
        }
        
        if (corteAltura) {
          // Sobra em cima (corte na altura)
          const descarteX = placaX + (corteLargura ? corteX / 2 : placaW / 2)
          const descarteY = placaY + corteY / 2
          svg += `<rect x="${descarteX - 28}" y="${descarteY - 9}" width="56" height="18" fill="#FF0000" rx="2"/>`
          svg += `<text x="${descarteX}" y="${descarteY + 4}" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">SOBRA</text>`
        }
        
        // Se tem corte em ambos (canto superior direito também é sobra)
        if (corteLargura && corteAltura) {
          const descarteX = placaX + corteX + (placaW - corteX) / 2
          const descarteY = placaY + corteY / 2
          svg += `<rect x="${descarteX - 28}" y="${descarteY - 9}" width="56" height="18" fill="#FF0000" rx="2"/>`
          svg += `<text x="${descarteX}" y="${descarteY + 4}" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle" font-family="monospace">SOBRA</text>`
        }
        
      } else {
        // Placa inteira - linhas diagonais e tag
        svg += `<line x1="${placaX}" y1="${placaY}" x2="${placaX + placaW}" y2="${placaY + placaH}" stroke="${corLinha}" stroke-width="0.3" opacity="0.3"/>`
        svg += `<line x1="${placaX + placaW}" y1="${placaY}" x2="${placaX}" y2="${placaY + placaH}" stroke="${corLinha}" stroke-width="0.3" opacity="0.3"/>`
        
        // Tag do painel
        const tagW = 32
        const tagH = 18
        const tagX = placaX + placaW/2 - tagW/2
        const tagY = placaY + placaH/2 - tagH/2
        svg += `<rect x="${tagX}" y="${tagY}" width="${tagW}" height="${tagH}" fill="#fff" stroke="${corLinha}" stroke-width="1.5"/>`
        svg += `<text x="${tagX + tagW/2}" y="${tagY + tagH/2 + 4}" text-anchor="middle" font-size="11" font-weight="bold" fill="${corTexto}" font-family="monospace">P${numeroPainel}</text>`
      }
      
      // 5. Desenhar RECORTES (portas/janelas) se existirem
      if (painel.recortes && painel.recortes.length > 0) {
        const corRecorte = '#8B4513' // Marrom para porta/janela
        const corRecorteFill = '#FFE4B5' // Bege claro
        
        for (const recorte of painel.recortes) {
          // Posição do recorte na placa (em escala)
          const recX = placaX + recorte.posicaoX * scale
          const recY = placaY + (PLACA_ALTURA - recorte.posicaoY - recorte.altura) * scale // Invertido pois Y cresce pra baixo
          const recW = recorte.largura * scale
          const recH = recorte.altura * scale
          
          // Desenha o recorte (área a ser removida)
          svg += `<rect x="${recX}" y="${recY}" width="${recW}" height="${recH}" fill="${corRecorteFill}" stroke="${corRecorte}" stroke-width="2"/>`
          
          // Hachura diagonal no recorte
          for (let i = 0; i < recW + recH; i += 6) {
            const x1 = recX + Math.min(i, recW)
            const y1 = recY + Math.max(0, i - recW)
            const x2 = recX + Math.max(0, i - recH)
            const y2 = recY + Math.min(i, recH)
            svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${corRecorte}" stroke-width="0.5" opacity="0.5"/>`
          }
          
          // Linha de corte tracejada ao redor do recorte
          svg += `<rect x="${recX}" y="${recY}" width="${recW}" height="${recH}" fill="none" stroke="#FF0000" stroke-width="2" stroke-dasharray="8,4"/>`
          
          // Tag RECORTE
          svg += `<rect x="${recX + recW/2 - 30}" y="${recY + recH/2 - 10}" width="60" height="20" fill="#8B4513" rx="3"/>`
          svg += `<text x="${recX + recW/2}" y="${recY + recH/2 + 4}" fill="#fff" font-size="8" font-weight="bold" text-anchor="middle" font-family="monospace">RECORTE</text>`
          
          // Cotas do recorte
          // Largura do recorte (embaixo)
          svg += `<text x="${recX + recW/2}" y="${recY + recH + 12}" fill="${corRecorte}" font-size="7" text-anchor="middle" font-family="monospace">${Math.round(recorte.largura)}</text>`
          // Altura do recorte (direita)
          svg += `<text x="${recX + recW + 8}" y="${recY + recH/2}" fill="${corRecorte}" font-size="7" dominant-baseline="middle" font-family="monospace">${Math.round(recorte.altura)}</text>`
          // Posição X
          svg += `<text x="${recX}" y="${recY - 5}" fill="${corRecorte}" font-size="6" text-anchor="start" font-family="monospace">X:${Math.round(recorte.posicaoX)}</text>`
          // Posição Y
          svg += `<text x="${recX - 5}" y="${recY + recH/2}" fill="${corRecorte}" font-size="6" text-anchor="end" dominant-baseline="middle" font-family="monospace">Y:${Math.round(recorte.posicaoY)}</text>`
        }
      }
      
      // Cotas da placa inteira (apenas na primeira coluna)
      if (idx === 0) {
        // Largura (embaixo)
        const cotaYB = placaY + placaH + (temCorte && corteLargura ? 22 : 10)
        svg += `<line x1="${placaX}" y1="${cotaYB}" x2="${placaX + placaW}" y2="${cotaYB}" stroke="${corCota}" stroke-width="0.8"/>`
        svg += `<line x1="${placaX}" y1="${cotaYB - 3}" x2="${placaX}" y2="${cotaYB + 3}" stroke="${corCota}" stroke-width="0.8"/>`
        svg += `<line x1="${placaX + placaW}" y1="${cotaYB - 3}" x2="${placaX + placaW}" y2="${cotaYB + 3}" stroke="${corCota}" stroke-width="0.8"/>`
        svg += `<text x="${placaX + placaW/2}" y="${cotaYB + 12}" fill="${corCota}" font-size="8" text-anchor="middle" font-family="monospace">${PLACA_LARGURA}</text>`
        
        // Altura (esquerda)
        const cotaXL = placaX - (temCorte && corteAltura ? 28 : 15)
        svg += `<line x1="${cotaXL}" y1="${placaY}" x2="${cotaXL}" y2="${placaY + placaH}" stroke="${corCota}" stroke-width="0.8"/>`
        svg += `<line x1="${cotaXL - 3}" y1="${placaY}" x2="${cotaXL + 3}" y2="${placaY}" stroke="${corCota}" stroke-width="0.8"/>`
        svg += `<line x1="${cotaXL - 3}" y1="${placaY + placaH}" x2="${cotaXL + 3}" y2="${placaY + placaH}" stroke="${corCota}" stroke-width="0.8"/>`
        svg += `<text x="${cotaXL - 3}" y="${placaY + placaH/2}" fill="${corCota}" font-size="8" text-anchor="end" dominant-baseline="middle" font-family="monospace">${PLACA_ALTURA}</text>`
      }
    }
  })
  
  // Footer / Legenda técnica
  const footerY = svgH - footerH
  svg += `<line x1="0" y1="${footerY}" x2="${svgW}" y2="${footerY}" stroke="${corLinha}" stroke-width="1"/>`
  svg += `<rect x="10" y="${footerY + 5}" width="${svgW - 20}" height="${footerH - 10}" fill="#fafafa" stroke="${corLinha}" stroke-width="0.5"/>`
  
  // Título da legenda
  svg += `<text x="20" y="${footerY + 18}" fill="${corTexto}" font-size="8" font-weight="bold" font-family="monospace">LEGENDA:</text>`
  
  // Items da legenda
  let lx = 90
  svg += `<rect x="${lx}" y="${footerY + 10}" width="18" height="12" fill="${corMadeirite}" stroke="${corLinha}" stroke-width="0.5"/>`
  svg += `<text x="${lx + 22}" y="${footerY + 19}" fill="${corTexto}" font-size="7" font-family="monospace">Madeirite</text>`
  
  lx += 80
  svg += `<rect x="${lx}" y="${footerY + 10}" width="18" height="12" fill="${corEps}" stroke="${corLinha}" stroke-width="0.5"/>`
  svg += `<text x="${lx + 22}" y="${footerY + 19}" fill="${corTexto}" font-size="7" font-family="monospace">EPS</text>`
  
  lx += 60
  svg += `<line x1="${lx}" y1="${footerY + 16}" x2="${lx + 18}" y2="${footerY + 16}" stroke="${corCorte}" stroke-width="2" stroke-dasharray="6,3"/>`
  svg += `<text x="${lx + 22}" y="${footerY + 19}" fill="${corTexto}" font-size="7" font-family="monospace">Linha de corte</text>`
  
  lx += 90
  svg += `<rect x="${lx}" y="${footerY + 10}" width="18" height="12" fill="${corDescarte}" stroke="${corCorte}" stroke-width="0.5"/>`
  svg += `<text x="${lx + 22}" y="${footerY + 19}" fill="${corTexto}" font-size="7" font-family="monospace">Descarte</text>`
  
  lx += 70
  svg += `<rect x="${lx}" y="${footerY + 10}" width="18" height="12" fill="none" stroke="${corUtil}" stroke-width="1.5"/>`
  svg += `<text x="${lx + 22}" y="${footerY + 19}" fill="${corTexto}" font-size="7" font-family="monospace">Área útil</text>`
  
  lx += 70
  svg += `<rect x="${lx}" y="${footerY + 10}" width="18" height="12" fill="#FFE4B5" stroke="#8B4513" stroke-width="1"/>`
  svg += `<text x="${lx + 22}" y="${footerY + 19}" fill="${corTexto}" font-size="7" font-family="monospace">Porta/Janela</text>`
  
  // Info da placa
  svg += `<text x="${svgW - 20}" y="${footerY + 19}" fill="${corCota}" font-size="7" text-anchor="end" font-family="monospace">Placa: ${PLACA_LARGURA}×${PLACA_ALTURA}cm</text>`
  
  // Segunda linha da legenda (instruções)
  svg += `<text x="20" y="${footerY + 38}" fill="${corCota}" font-size="7" font-family="monospace">INSTRUÇÕES: Cortar nas linhas tracejadas vermelhas. Recortar aberturas (porta/janela) conforme indicado.</text>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;height:auto;">
    ${svg}
  </svg>`
}

/**
 * Calcula todos os painéis de uma parede baseado nos dados de cálculo
 * Usa os dados do backend quando disponíveis
 */
function calcularPaineis(dados: DadosParede): PainelCorte[] {
  const calculo = dados.calculo
  const paineis: PainelCorte[] = []
  let num = 1
  
  // 1. Placas inteiras (110 x 220)
  for (let i = 0; i < calculo.placasInteiras; i++) {
    paineis.push({
      numeroPainel: num++,
      larguraFinal: PLACA_LARGURA,
      alturaFinal: PLACA_ALTURA,
      temCorte: false,
      corteLargura: false,
      corteAltura: false,
    })
  }
  
  // 2. Placas com corte apenas no comprimento (largura cortada, altura inteira)
  if (calculo.qtdPlacasCorteComprimento > 0 && calculo.placaCorteComprimento) {
    const larguraCorteCm = mToCm(calculo.placaCorteComprimento.comprimento)
    // Se altura do corte é 0, usa altura padrão (220)
    const alturaCm = calculo.placaCorteComprimento.altura > 0 
      ? mToCm(calculo.placaCorteComprimento.altura) 
      : PLACA_ALTURA
    
    // Só adiciona se largura > 0
    if (larguraCorteCm > 0) {
      for (let i = 0; i < calculo.qtdPlacasCorteComprimento; i++) {
        paineis.push({
          numeroPainel: num++,
          larguraFinal: Math.round(larguraCorteCm),
          alturaFinal: Math.round(alturaCm),
          temCorte: true,
          corteLargura: true,
          corteAltura: false,
        })
      }
    }
  }
  
  // 3. Placas com corte apenas na altura (largura inteira, altura cortada)
  if (calculo.qtdPlacasCorteAltura > 0 && calculo.placaCorteAltura) {
    const alturaCorteCm = mToCm(calculo.placaCorteAltura.altura)
    // Se comprimento do corte é 0, usa largura padrão (110)
    const larguraCm = calculo.placaCorteAltura.comprimento > 0 
      ? mToCm(calculo.placaCorteAltura.comprimento) 
      : PLACA_LARGURA
    
    // Só adiciona se altura > 0
    if (alturaCorteCm > 0) {
      for (let i = 0; i < calculo.qtdPlacasCorteAltura; i++) {
        paineis.push({
          numeroPainel: num++,
          larguraFinal: Math.round(larguraCm),
          alturaFinal: Math.round(alturaCorteCm),
          temCorte: true,
          corteLargura: false,
          corteAltura: true,
        })
      }
    }
  }
  
  // 4. Placas com corte em ambos (largura e altura cortadas)
  if (calculo.qtdPlacaCorteAlturaEComprimento > 0 && calculo.placaCorteAlturaEComprimento.length > 0) {
    for (const corte of calculo.placaCorteAlturaEComprimento) {
      const larguraCm = mToCm(corte.comprimento)
      const alturaCm = mToCm(corte.altura)
      
      // Só adiciona se ambas dimensões > 0
      if (larguraCm > 0 && alturaCm > 0) {
        paineis.push({
          numeroPainel: num++,
          larguraFinal: Math.round(larguraCm),
          alturaFinal: Math.round(alturaCm),
          temCorte: true,
          corteLargura: true,
          corteAltura: true,
        })
      }
    }
  }
  
  // 5. Placas com recortes internos (portas/janelas)
  if (calculo.placaCorteAlturaEComprimentoPosicaoY?.placas) {
    for (const placa of calculo.placaCorteAlturaEComprimentoPosicaoY.placas) {
      const larguraCm = mToCm(placa.larguraPlaca)
      const alturaCm = mToCm(placa.alturaPlaca)
      
      // Converte recortes para cm
      const recortesCm: RecorteDTO[] = (placa.recortes || []).map(r => ({
        largura: mToCm(r.largura),
        altura: mToCm(r.altura),
        posicaoX: mToCm(r.posicaoX),
        posicaoY: mToCm(r.posicaoY),
      }))
      
      paineis.push({
        numeroPainel: num++,
        larguraFinal: Math.round(larguraCm),
        alturaFinal: Math.round(alturaCm),
        temCorte: true,
        corteLargura: larguraCm < PLACA_LARGURA,
        corteAltura: alturaCm < PLACA_ALTURA,
        recortes: recortesCm,
      })
    }
  }
  
  return paineis
}

/**
 * Gera SVG de montagem geral da parede - Estilo técnico AutoCAD
 */
function gerarSvgMontagem(dados: DadosParede): string {
  const compCm = mToCm(dados.comprimento)
  const altCm = mToCm(dados.altura)
  const paineis = calcularPaineis(dados)
  
  const colsInteiras = Math.floor(compCm / PLACA_LARGURA)
  const rowsInteiras = Math.floor(altCm / PLACA_ALTURA)
  const sobraX = compCm - (colsInteiras * PLACA_LARGURA)
  const sobraY = altCm - (rowsInteiras * PLACA_ALTURA)
  
  const totalCols = colsInteiras + (sobraX > 0 ? 1 : 0)
  const totalRows = rowsInteiras + (sobraY > 0 ? 1 : 0)
  
  const svgW = 700
  const svgH = 520
  const margin = 80
  const headerH = 50
  
  const areaW = svgW - margin * 2
  const areaH = svgH - headerH - margin - 80
  
  const scale = Math.min(areaW / compCm, areaH / altCm) * 0.9
  
  const drawW = compCm * scale
  const drawH = altCm * scale
  const startX = margin + (areaW - drawW) / 2
  const startY = headerH + 40

  // Cores estilo técnico
  const corFundo = '#ffffff'
  const corLinha = '#2c3e50'
  const corPainelInteiro = '#e8f4fc'  // Azul bem claro
  const corPainelCorte = '#e8f8e8'     // Verde bem claro
  const corBordaInteiro = '#1e5f8a'    // Azul escuro
  const corBordaCorte = '#2d7a4a'      // Verde escuro
  const corCota = '#555555'
  const corTexto = '#1a1a1a'

  let svg = ''
  
  // Fundo branco (estilo planta)
  svg += `<rect width="100%" height="100%" fill="${corFundo}"/>`
  
  // Grid de fundo sutil
  for (let gx = 0; gx < svgW; gx += 20) {
    svg += `<line x1="${gx}" y1="0" x2="${gx}" y2="${svgH}" stroke="#f0f0f0" stroke-width="0.5"/>`
  }
  for (let gy = 0; gy < svgH; gy += 20) {
    svg += `<line x1="0" y1="${gy}" x2="${svgW}" y2="${gy}" stroke="#f0f0f0" stroke-width="0.5"/>`
  }
  
  // Carimbo técnico (canto superior)
  svg += `<rect x="${svgW - 180}" y="10" width="170" height="35" fill="none" stroke="${corLinha}" stroke-width="1"/>`
  svg += `<line x1="${svgW - 180}" y1="25" x2="${svgW - 10}" y2="25" stroke="${corLinha}" stroke-width="0.5"/>`
  svg += `<text x="${svgW - 95}" y="20" text-anchor="middle" font-size="8" fill="${corTexto}" font-family="monospace">SPEEDFORMAS</text>`
  svg += `<text x="${svgW - 95}" y="38" text-anchor="middle" font-size="7" fill="${corCota}" font-family="monospace">${dados.nomeComodo} - ${dados.identificacaoParede}</text>`
  
  // Título
  svg += `<text x="15" y="25" font-size="11" fill="${corTexto}" font-weight="bold" font-family="monospace">PLANTA DE MONTAGEM - PAREDE ${dados.identificacaoParede}</text>`
  svg += `<text x="15" y="38" font-size="9" fill="${corCota}" font-family="monospace">Escala: 1:${Math.round(1/scale * 10)} | Unidade: cm</text>`
  
  // Linha separadora
  svg += `<line x1="10" y1="${headerH}" x2="${svgW - 10}" y2="${headerH}" stroke="${corLinha}" stroke-width="0.5"/>`
  
  let num = 1
  const tags: { x: number; y: number; num: number; isCorte: boolean; w: number; h: number }[] = []
  
  for (let row = 0; row < totalRows; row++) {
    const isTop = row === totalRows - 1
    const placaH = isTop && sobraY > 0 ? sobraY : PLACA_ALTURA
    const h = Math.max(1, placaH * scale)
    
    for (let col = 0; col < totalCols; col++) {
      const isRight = col === totalCols - 1
      const placaW = isRight && sobraX > 0 ? sobraX : PLACA_LARGURA
      const w = Math.max(1, placaW * scale)
      const x = startX + col * PLACA_LARGURA * scale
      const y = startY + drawH - (row + 1) * PLACA_ALTURA * scale
      const yFinal = Math.max(startY, isTop && sobraY > 0 ? startY : y)
      
      const isCorte = (isTop && sobraY > 0) || (isRight && sobraX > 0)
      
      // Painel - azul para inteiros, verde para corte
      const corFill = isCorte ? corPainelCorte : corPainelInteiro
      const corBorda = isCorte ? corBordaCorte : corBordaInteiro
      
      // Hachura para painéis com corte
      if (isCorte) {
        svg += `<defs><pattern id="hatch${num}" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="${corBordaCorte}" stroke-width="0.5" opacity="0.3"/>
        </pattern></defs>`
        svg += `<rect x="${x}" y="${yFinal}" width="${w}" height="${h}" fill="url(#hatch${num})"/>`
      }
      
      svg += `<rect x="${x}" y="${yFinal}" width="${w}" height="${h}" fill="${corFill}" fill-opacity="0.7" stroke="${corBorda}" stroke-width="1.5"/>`
      
      // Linhas diagonais estilo planta (centro)
      svg += `<line x1="${x}" y1="${yFinal}" x2="${x + w}" y2="${yFinal + h}" stroke="${corBorda}" stroke-width="0.3" opacity="0.4"/>`
      svg += `<line x1="${x + w}" y1="${yFinal}" x2="${x}" y2="${yFinal + h}" stroke="${corBorda}" stroke-width="0.3" opacity="0.4"/>`
      
      // Guardar posição para tags
      tags.push({ x: x + w/2, y: yFinal + h/2, num, isCorte, w: Math.round(placaW), h: Math.round(placaH) })
      
      num++
    }
  }
  
  // Tags de identificação (estilo AutoCAD - retângulo com linha de chamada)
  tags.forEach(tag => {
    const tagW = 28
    const tagH = 16
    const tagX = tag.x - tagW/2
    const tagY = tag.y - tagH/2
    
    const corTag = tag.isCorte ? corBordaCorte : corBordaInteiro
    
    // Tag retangular
    svg += `<rect x="${tagX}" y="${tagY}" width="${tagW}" height="${tagH}" fill="#fff" stroke="${corTag}" stroke-width="1.5"/>`
    svg += `<text x="${tag.x}" y="${tag.y + 4}" text-anchor="middle" font-size="10" font-weight="bold" fill="${corTag}" font-family="monospace">P${tag.num}</text>`
    
    // Dimensão pequena abaixo
    svg += `<text x="${tag.x}" y="${tag.y + tagH/2 + 12}" text-anchor="middle" font-size="7" fill="${corCota}" font-family="monospace">${tag.w}×${tag.h}</text>`
  })
  
  // ========== DESENHAR PORTAS ==========
  if (dados.portas && dados.portas.length > 0) {
    const corPorta = '#8B4513' // Marrom
    const corPortaFill = '#D2691E' // Marrom claro
    
    dados.portas.forEach((porta, idx) => {
      // Posições em cm
      const portaXcm = mToCm(porta.posicaoX) // Distância horizontal do início da parede
      const portaYcm = mToCm(porta.posicaoY) // Altura a partir do solo (geralmente 0 para portas)
      const portaWcm = mToCm(porta.comprimento) // Largura da porta
      const portaHcm = mToCm(porta.altura) // Altura da porta
      
      // Posições no SVG (Y invertido - 0 no topo)
      const px = startX + portaXcm * scale
      const py = startY + drawH - portaYcm * scale - portaHcm * scale
      const pw = portaWcm * scale
      const ph = portaHcm * scale
      
      // Fundo da abertura (vazio/transparente)
      svg += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#fff" stroke="${corPorta}" stroke-width="1" stroke-dasharray="4,2"/>`
      
      // Porta (folha) - retângulo sólido
      svg += `<rect x="${px + 2}" y="${py + 2}" width="${pw - 4}" height="${ph - 4}" fill="${corPortaFill}" stroke="${corPorta}" stroke-width="2"/>`
      
      // Maçaneta
      const macX = px + pw - 12
      const macY = py + ph/2
      svg += `<circle cx="${macX}" cy="${macY}" r="3" fill="${corPorta}"/>`
      
      // Arco de abertura (indicando sentido)
      svg += `<path d="M ${px + pw} ${py + ph} A ${pw * 0.8} ${pw * 0.8} 0 0 1 ${px + pw - pw * 0.8} ${py + ph}" fill="none" stroke="${corPorta}" stroke-width="1" stroke-dasharray="3,2"/>`
      
      // Label PORTA
      svg += `<rect x="${px + pw/2 - 20}" y="${py + ph/2 - 8}" width="40" height="16" fill="#fff" stroke="${corPorta}" stroke-width="1" rx="2"/>`
      svg += `<text x="${px + pw/2}" y="${py + ph/2 + 4}" text-anchor="middle" font-size="8" font-weight="bold" fill="${corPorta}" font-family="monospace">PORTA</text>`
      
      // Cota da largura da porta (em cima)
      svg += `<line x1="${px}" y1="${py - 8}" x2="${px + pw}" y2="${py - 8}" stroke="${corPorta}" stroke-width="0.8"/>`
      svg += `<line x1="${px}" y1="${py - 12}" x2="${px}" y2="${py - 4}" stroke="${corPorta}" stroke-width="0.8"/>`
      svg += `<line x1="${px + pw}" y1="${py - 12}" x2="${px + pw}" y2="${py - 4}" stroke="${corPorta}" stroke-width="0.8"/>`
      svg += `<rect x="${px + pw/2 - 14}" y="${py - 18}" width="28" height="12" fill="#fff"/>`
      svg += `<text x="${px + pw/2}" y="${py - 9}" text-anchor="middle" font-size="7" font-weight="bold" fill="${corPorta}" font-family="monospace">${Math.round(portaWcm)}</text>`
      
      // Cota da altura da porta (lateral direita)
      svg += `<line x1="${px + pw + 5}" y1="${py}" x2="${px + pw + 5}" y2="${py + ph}" stroke="${corPorta}" stroke-width="0.8"/>`
      svg += `<line x1="${px + pw + 2}" y1="${py}" x2="${px + pw + 8}" y2="${py}" stroke="${corPorta}" stroke-width="0.8"/>`
      svg += `<line x1="${px + pw + 2}" y1="${py + ph}" x2="${px + pw + 8}" y2="${py + ph}" stroke="${corPorta}" stroke-width="0.8"/>`
      svg += `<text x="${px + pw + 12}" y="${py + ph/2 + 3}" text-anchor="start" font-size="7" font-weight="bold" fill="${corPorta}" font-family="monospace">${Math.round(portaHcm)}</text>`
      
      // Cota de posição X (distância do início da parede)
      if (portaXcm > 0) {
        const cotaPosY = startY + drawH + 3
        svg += `<line x1="${startX}" y1="${cotaPosY}" x2="${px}" y2="${cotaPosY}" stroke="${corPorta}" stroke-width="0.5" stroke-dasharray="2,2"/>`
        svg += `<text x="${startX + (px - startX)/2}" y="${cotaPosY + 8}" text-anchor="middle" font-size="6" fill="${corPorta}" font-family="monospace">↔ ${Math.round(portaXcm)}</text>`
      }
    })
  }
  
  // ========== DESENHAR JANELAS ==========
  if (dados.janelas && dados.janelas.length > 0) {
    const corJanela = '#1E90FF' // Azul
    const corJanelaFill = '#87CEEB' // Azul claro (céu)
    
    dados.janelas.forEach((janela, idx) => {
      // Posições em cm
      const janelaXcm = mToCm(janela.posicaoX) // Distância horizontal do início da parede
      const janelaSoloCm = mToCm(janela.posicaoSolo) // Altura a partir do solo
      const janelaWcm = mToCm(janela.comprimento) // Largura da janela
      const janelaHcm = mToCm(janela.altura) // Altura da janela
      
      // Posições no SVG (Y invertido - 0 no topo)
      const jx = startX + janelaXcm * scale
      const jy = startY + drawH - janelaSoloCm * scale - janelaHcm * scale
      const jw = janelaWcm * scale
      const jh = janelaHcm * scale
      
      // Fundo da janela (céu)
      svg += `<rect x="${jx}" y="${jy}" width="${jw}" height="${jh}" fill="${corJanelaFill}" stroke="${corJanela}" stroke-width="2"/>`
      
      // Moldura externa
      svg += `<rect x="${jx + 3}" y="${jy + 3}" width="${jw - 6}" height="${jh - 6}" fill="none" stroke="${corJanela}" stroke-width="1"/>`
      
      // Divisórias da janela (cruz - 4 vidros)
      svg += `<line x1="${jx + jw/2}" y1="${jy}" x2="${jx + jw/2}" y2="${jy + jh}" stroke="${corJanela}" stroke-width="2"/>`
      svg += `<line x1="${jx}" y1="${jy + jh/2}" x2="${jx + jw}" y2="${jy + jh/2}" stroke="${corJanela}" stroke-width="2"/>`
      
      // Label JANELA
      svg += `<rect x="${jx + jw/2 - 22}" y="${jy + jh/2 - 8}" width="44" height="16" fill="#fff" stroke="${corJanela}" stroke-width="1" rx="2"/>`
      svg += `<text x="${jx + jw/2}" y="${jy + jh/2 + 4}" text-anchor="middle" font-size="8" font-weight="bold" fill="${corJanela}" font-family="monospace">JANELA</text>`
      
      // Cota da largura (em cima)
      svg += `<line x1="${jx}" y1="${jy - 8}" x2="${jx + jw}" y2="${jy - 8}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<line x1="${jx}" y1="${jy - 12}" x2="${jx}" y2="${jy - 4}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<line x1="${jx + jw}" y1="${jy - 12}" x2="${jx + jw}" y2="${jy - 4}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<rect x="${jx + jw/2 - 14}" y="${jy - 18}" width="28" height="12" fill="#fff"/>`
      svg += `<text x="${jx + jw/2}" y="${jy - 9}" text-anchor="middle" font-size="7" font-weight="bold" fill="${corJanela}" font-family="monospace">${Math.round(janelaWcm)}</text>`
      
      // Cota da altura (lateral direita)
      svg += `<line x1="${jx + jw + 5}" y1="${jy}" x2="${jx + jw + 5}" y2="${jy + jh}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<line x1="${jx + jw + 2}" y1="${jy}" x2="${jx + jw + 8}" y2="${jy}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<line x1="${jx + jw + 2}" y1="${jy + jh}" x2="${jx + jw + 8}" y2="${jy + jh}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<text x="${jx + jw + 12}" y="${jy + jh/2 + 3}" text-anchor="start" font-size="7" font-weight="bold" fill="${corJanela}" font-family="monospace">${Math.round(janelaHcm)}</text>`
      
      // Cota de posição X (distância do início da parede)
      if (janelaXcm > 0) {
        const cotaPosY = startY + drawH + 3
        svg += `<line x1="${startX}" y1="${cotaPosY}" x2="${jx}" y2="${cotaPosY}" stroke="${corJanela}" stroke-width="0.5" stroke-dasharray="2,2"/>`
        svg += `<text x="${startX + (jx - startX)/2}" y="${cotaPosY + 8}" text-anchor="middle" font-size="6" fill="${corJanela}" font-family="monospace">↔ ${Math.round(janelaXcm)}</text>`
      }
      
      // Cota altura do solo (lateral esquerda) - linha vertical do chão até a janela
      const soloY = startY + drawH
      svg += `<line x1="${jx - 8}" y1="${soloY}" x2="${jx - 8}" y2="${jy + jh}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<line x1="${jx - 12}" y1="${soloY}" x2="${jx - 4}" y2="${soloY}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<line x1="${jx - 12}" y1="${jy + jh}" x2="${jx - 4}" y2="${jy + jh}" stroke="${corJanela}" stroke-width="0.8"/>`
      svg += `<text x="${jx - 14}" y="${soloY - (soloY - jy - jh)/2}" text-anchor="end" font-size="6" fill="${corJanela}" font-family="monospace" transform="rotate(-90, ${jx - 14}, ${soloY - (soloY - jy - jh)/2})">Solo: ${Math.round(janelaSoloCm)}</text>`
    })
  }
  
  // Cotas externas (estilo técnico)
  const cotaOffset = 20
  const cotaExt = 35
  
  // Cota horizontal (largura total)
  const cotaYBottom = startY + drawH + cotaOffset
  svg += `<line x1="${startX}" y1="${cotaYBottom}" x2="${startX}" y2="${cotaYBottom + 10}" stroke="${corCota}" stroke-width="0.8"/>`
  svg += `<line x1="${startX + drawW}" y1="${cotaYBottom}" x2="${startX + drawW}" y2="${cotaYBottom + 10}" stroke="${corCota}" stroke-width="0.8"/>`
  svg += `<line x1="${startX}" y1="${cotaYBottom + 5}" x2="${startX + drawW}" y2="${cotaYBottom + 5}" stroke="${corCota}" stroke-width="0.8"/>`
  svg += `<polygon points="${startX},${cotaYBottom + 5} ${startX + 6},${cotaYBottom + 2} ${startX + 6},${cotaYBottom + 8}" fill="${corCota}"/>`
  svg += `<polygon points="${startX + drawW},${cotaYBottom + 5} ${startX + drawW - 6},${cotaYBottom + 2} ${startX + drawW - 6},${cotaYBottom + 8}" fill="${corCota}"/>`
  svg += `<rect x="${startX + drawW/2 - 25}" y="${cotaYBottom + 10}" width="50" height="14" fill="#fff"/>`
  svg += `<text x="${startX + drawW/2}" y="${cotaYBottom + 20}" text-anchor="middle" font-size="10" font-weight="bold" fill="${corTexto}" font-family="monospace">${Math.round(compCm)}</text>`
  
  // Cota vertical (altura total)
  const cotaXLeft = startX - cotaOffset
  svg += `<line x1="${cotaXLeft}" y1="${startY}" x2="${cotaXLeft - 10}" y2="${startY}" stroke="${corCota}" stroke-width="0.8"/>`
  svg += `<line x1="${cotaXLeft}" y1="${startY + drawH}" x2="${cotaXLeft - 10}" y2="${startY + drawH}" stroke="${corCota}" stroke-width="0.8"/>`
  svg += `<line x1="${cotaXLeft - 5}" y1="${startY}" x2="${cotaXLeft - 5}" y2="${startY + drawH}" stroke="${corCota}" stroke-width="0.8"/>`
  svg += `<polygon points="${cotaXLeft - 5},${startY} ${cotaXLeft - 2},${startY + 6} ${cotaXLeft - 8},${startY + 6}" fill="${corCota}"/>`
  svg += `<polygon points="${cotaXLeft - 5},${startY + drawH} ${cotaXLeft - 2},${startY + drawH - 6} ${cotaXLeft - 8},${startY + drawH - 6}" fill="${corCota}"/>`
  svg += `<rect x="${cotaXLeft - 30}" y="${startY + drawH/2 - 7}" width="24" height="14" fill="#fff"/>`
  svg += `<text x="${cotaXLeft - 18}" y="${startY + drawH/2 + 4}" text-anchor="middle" font-size="10" font-weight="bold" fill="${corTexto}" font-family="monospace">${Math.round(altCm)}</text>`
  
  // Legenda técnica (canto inferior)
  const legendY = svgH - 55
  svg += `<rect x="10" y="${legendY}" width="${svgW - 20}" height="45" fill="none" stroke="${corLinha}" stroke-width="1"/>`
  svg += `<line x1="10" y1="${legendY + 15}" x2="${svgW - 10}" y2="${legendY + 15}" stroke="${corLinha}" stroke-width="0.5"/>`
  svg += `<text x="20" y="${legendY + 11}" font-size="8" font-weight="bold" fill="${corTexto}" font-family="monospace">LEGENDA</text>`
  
  // Items da legenda
  let lx = 20
  svg += `<rect x="${lx}" y="${legendY + 22}" width="16" height="12" fill="${corPainelInteiro}" stroke="${corBordaInteiro}" stroke-width="1"/>`
  svg += `<text x="${lx + 20}" y="${legendY + 31}" font-size="7" fill="${corTexto}" font-family="monospace">Inteiro</text>`
  
  lx = 90
  svg += `<rect x="${lx}" y="${legendY + 22}" width="16" height="12" fill="${corPainelCorte}" stroke="${corBordaCorte}" stroke-width="1"/>`
  svg += `<line x1="${lx}" y1="${legendY + 22}" x2="${lx + 16}" y2="${legendY + 34}" stroke="${corBordaCorte}" stroke-width="0.3"/>`
  svg += `<text x="${lx + 20}" y="${legendY + 31}" font-size="7" fill="${corTexto}" font-family="monospace">Corte</text>`
  
  // Legenda porta
  lx = 155
  svg += `<rect x="${lx}" y="${legendY + 22}" width="16" height="12" fill="#D2691E" stroke="#8B4513" stroke-width="1"/>`
  svg += `<text x="${lx + 8}" y="${legendY + 31}" text-anchor="middle" font-size="8">🚪</text>`
  svg += `<text x="${lx + 20}" y="${legendY + 31}" font-size="7" fill="${corTexto}" font-family="monospace">Porta</text>`
  
  // Legenda janela
  lx = 210
  svg += `<rect x="${lx}" y="${legendY + 22}" width="16" height="12" fill="#87CEEB" stroke="#1E90FF" stroke-width="1"/>`
  svg += `<line x1="${lx + 8}" y1="${legendY + 22}" x2="${lx + 8}" y2="${legendY + 34}" stroke="#1E90FF" stroke-width="0.5"/>`
  svg += `<line x1="${lx}" y1="${legendY + 28}" x2="${lx + 16}" y2="${legendY + 28}" stroke="#1E90FF" stroke-width="0.5"/>`
  svg += `<text x="${lx + 20}" y="${legendY + 31}" font-size="7" fill="${corTexto}" font-family="monospace">Janela</text>`
  
  // Resumo
  const paineisInteiros = paineis.filter(p => !p.temCorte).length
  const paineisCorte = paineis.filter(p => p.temCorte).length
  const totalPortas = dados.portas?.length || 0
  const totalJanelas = dados.janelas?.length || 0
  
  let resumo = `TOTAL: ${paineis.length} painéis`
  if (totalPortas > 0 || totalJanelas > 0) {
    resumo += ` | ${totalPortas} porta(s) | ${totalJanelas} janela(s)`
  }
  svg += `<text x="${svgW - 25}" y="${legendY + 32}" text-anchor="end" font-size="8" fill="${corTexto}" font-family="monospace">${resumo}</text>`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;height:auto;">
    ${svg}
  </svg>`
}

export function gerarSvgsCorte(dados: DadosParede): SvgCorteResult {
  const paineis = calcularPaineis(dados)
  
  const paineisSvg: PainelSvg[] = paineis.map(painel => ({
    numeroPainel: painel.numeroPainel,
    largura: painel.larguraFinal,
    altura: painel.alturaFinal,
    temCorte: painel.temCorte,
    svg: gerarSvgPainelSpeedFormas(painel, dados),
  }))
  
  return {
    svgPlacaInterna: '',
    svgPlacaExterna: '',
    svgEps: '',
    svgMontagem: gerarSvgMontagem(dados),
    svgPadraoSpeedFormas: paineisSvg.length > 0 ? paineisSvg[0].svg : '',
    paineis: paineisSvg,
  }
}

export function calcularCortesLocal(identificador: string, comprimento: number, altura: number): CalculoCorte {
  const compCm = mToCm(comprimento)
  const altCm = mToCm(altura)
  
  const placasH = Math.floor(compCm / PLACA_LARGURA)
  const placasV = Math.floor(altCm / PLACA_ALTURA)
  const sobraH = compCm % PLACA_LARGURA
  const sobraV = altCm % PLACA_ALTURA
  
  const placasInteiras = placasH * placasV
  const qtdPlacasCorteComprimento = sobraH > 0 ? placasV : 0
  const placaCorteComprimento = sobraH > 0 ? { altura: PLACA_ALTURA, comprimento: sobraH } : null
  const qtdPlacasCorteAltura = sobraV > 0 ? placasH : 0
  const placaCorteAltura = sobraV > 0 ? { altura: sobraV, comprimento: PLACA_LARGURA } : null
  const qtdPlacaCorteAlturaEComprimento = (sobraH > 0 && sobraV > 0) ? 1 : 0
  const placaCorteAlturaEComprimento = (sobraH > 0 && sobraV > 0) ? [{ altura: sobraV, comprimento: sobraH }] : []
  const totalPlacas = placasInteiras + qtdPlacasCorteComprimento + qtdPlacasCorteAltura + qtdPlacaCorteAlturaEComprimento

  return {
    identificador,
    placasInteiras,
    qtdPlacasCorteComprimento,
    placaCorteComprimento,
    qtdPlacasCorteAltura,
    placaCorteAltura,
    qtdPlacaCorteAlturaEComprimento,
    placaCorteAlturaEComprimento,
    totalPlacas,
  }
}
