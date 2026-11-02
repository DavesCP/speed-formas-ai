"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { DXFParser, type DXFData, type DXFEntity } from "@/lib/parsers/dxf-parser"
import { DWGParser } from "@/lib/parsers/dwg-parser"

interface CADRendererProps {
  file: File
  width?: number
  height?: number
  onLoaded?: (data: DXFData) => void
  className?: string
}

// Cores vibrantes para fundo branco
const ENTITY_COLORS = {
  LINE: "#e74c3c",      // Vermelho vibrante para linhas
  CIRCLE: "#3498db",    // Azul vibrante para círculos  
  ARC: "#9b59b6",       // Roxo vibrante para arcos
  TEXT: "#2c3e50",      // Azul escuro para textos
  POLYLINE: "#27ae60"   // Verde vibrante para polylines
}

interface ViewTransform {
  zoom: number
  panX: number
  panY: number
}

export function CADRenderer({ file, width, height, onLoaded, className = "" }: CADRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dxfData, setDxfData] = useState<DXFData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(new Set())
  const [transform, setTransform] = useState<ViewTransform>({ zoom: 1, panX: 0, panY: 0 })
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 })

  // Estados para pan
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  // Calcular tamanho responsivo do canvas
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const rect = container.getBoundingClientRect()
        
        const maxWidth = typeof window !== 'undefined' ? window.innerWidth - 40 : 800
        const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.6 : 500
        
        const newWidth = width || Math.min(Math.max(rect.width, 400), maxWidth)
        const newHeight = height || Math.min(Math.max(400, Math.floor(rect.height || 400)), maxHeight)
        
        setCanvasSize({ width: Math.floor(newWidth), height: Math.floor(newHeight) })
      }
    }

    const timer = setTimeout(updateCanvasSize, 100)
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateCanvasSize)
    }
    
    return () => {
      clearTimeout(timer)
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', updateCanvasSize)
      }
    }
  }, [width, height])

  // Event listener para wheel com preventDefault
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault()
      
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.2, Math.min(5, transform.zoom * zoomFactor))
      
      const newPanX = mouseX - (mouseX - transform.panX) * zoomFactor
      const newPanY = mouseY - (mouseY - transform.panY) * zoomFactor
      
      setTransform({
        zoom: newZoom,
        panX: newPanX,
        panY: newPanY
      })
    }

    canvas.addEventListener('wheel', handleWheelEvent, { passive: false })
    
    return () => {
      canvas.removeEventListener('wheel', handleWheelEvent)
    }
  }, [transform])

  // Parse do arquivo
  useEffect(() => {
    loadDXFFile()
  }, [file])

  const loadDXFFile = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const fileExtension = file.name.toLowerCase().split('.').pop()
      let data: DXFData

      if (fileExtension === 'dxf') {
        const parser = new DXFParser()
        data = await parser.parse(file)
      } else if (fileExtension === 'dwg') {
        const parser = new DWGParser()
        data = await parser.parse(file)
      } else {
        throw new Error(`Formato não suportado: .${fileExtension}`)
      }
      
      setDxfData(data)
      setVisibleLayers(new Set(data.layers.map(l => l.name)))
      
      // Calcular zoom inicial
      const initialTransform = calculateInitialView(data, canvasSize.width, canvasSize.height)
      setTransform(initialTransform)
      
      onLoaded?.(data)
    } catch (err) {
      console.error("Erro ao carregar arquivo CAD:", err)
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular visualização inicial
  const calculateInitialView = (data: DXFData, canvasWidth: number, canvasHeight: number): ViewTransform => {
    const { bounds } = data
    const drawingWidth = bounds.maxX - bounds.minX
    const drawingHeight = bounds.maxY - bounds.minY
    
    if (drawingWidth === 0 || drawingHeight === 0) {
      return { zoom: 1, panX: canvasWidth / 2, panY: canvasHeight / 2 }
    }
    
    const scaleX = (canvasWidth * 0.8) / drawingWidth
    const scaleY = (canvasHeight * 0.8) / drawingHeight
    const zoom = Math.min(scaleX, scaleY, 2)
    
    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2
    const panX = canvasWidth / 2 - centerX * zoom
    const panY = canvasHeight / 2 + centerY * zoom
    
    return { zoom, panX, panY }
  }

  // Renderização principal
  useEffect(() => {
    if (!dxfData || !canvasRef.current || isLoading) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    renderCAD(ctx, dxfData, transform, visibleLayers, canvasSize.width, canvasSize.height)
  }, [dxfData, transform, visibleLayers, canvasSize])

  // Função de renderização principal
  const renderCAD = (
    ctx: CanvasRenderingContext2D,
    data: DXFData,
    transform: ViewTransform,
    visibleLayers: Set<string>,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // Limpar canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // Aplicar transformações
    ctx.save()
    ctx.translate(transform.panX, transform.panY)
    ctx.scale(transform.zoom, -transform.zoom) // Y invertido para CAD
    
    // Configurações
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    
    // Renderizar grid suave
    if (transform.zoom > 0.5) {
      renderGrid(ctx, data.bounds, transform.zoom)
    }
    
    // Renderizar entidades
    data.entities.forEach((entity) => {
      if (visibleLayers.has(entity.layer)) {
        renderEntity(ctx, entity, transform.zoom)
      }
    })
    
    ctx.restore()
    
    // Info overlay
    renderOverlay(ctx, data, transform, canvasWidth, canvasHeight)
  }

  // Renderizar uma entidade
  const renderEntity = (ctx: CanvasRenderingContext2D, entity: DXFEntity, zoom: number) => {
    // Cor por tipo de entidade
    const entityColor = ENTITY_COLORS[entity.type] || "#2c3e50"
    ctx.strokeStyle = entityColor
    ctx.fillStyle = entityColor
    ctx.lineWidth = Math.max(1.5, 2 / zoom)
    
    switch (entity.type) {
      case "LINE":
        ctx.beginPath()
        ctx.moveTo(entity.start.x, entity.start.y)
        ctx.lineTo(entity.end.x, entity.end.y)
        ctx.stroke()
        break
        
      case "CIRCLE":
        ctx.beginPath()
        ctx.arc(entity.center.x, entity.center.y, entity.radius, 0, 2 * Math.PI)
        ctx.stroke()
        break
        
      case "ARC":
        ctx.beginPath()
        ctx.arc(entity.center.x, entity.center.y, entity.radius, entity.startAngle, entity.endAngle)
        ctx.stroke()
        break
        
      case "TEXT":
        if (zoom > 0.3) {
          const fontSize = Math.max(10, entity.height * zoom)
          ctx.font = `${fontSize}px Arial`
          ctx.save()
          ctx.scale(1, -1)
          ctx.fillText(entity.text, entity.position.x, -entity.position.y)
          ctx.restore()
        }
        break
        
      case "POLYLINE":
        if (entity.points.length > 1) {
          ctx.beginPath()
          ctx.moveTo(entity.points[0].x, entity.points[0].y)
          for (let i = 1; i < entity.points.length; i++) {
            ctx.lineTo(entity.points[i].x, entity.points[i].y)
          }
          if (entity.closed) {
            ctx.closePath()
          }
          ctx.stroke()
        }
        break
    }
  }

  // Grid otimizado
  const renderGrid = (ctx: CanvasRenderingContext2D, bounds: any, zoom: number) => {
    if (zoom < 0.5) return
    
    ctx.strokeStyle = "#f0f0f0"
    ctx.lineWidth = 0.5 / zoom
    
    const gridSize = zoom > 1 ? 25 : 100
    const startX = Math.floor(bounds.minX / gridSize) * gridSize
    const endX = Math.ceil(bounds.maxX / gridSize) * gridSize
    const startY = Math.floor(bounds.minY / gridSize) * gridSize
    const endY = Math.ceil(bounds.maxY / gridSize) * gridSize
    
    // Limitar linhas para performance
    const maxLines = 30
    const stepX = Math.max(gridSize, (endX - startX) / maxLines)
    const stepY = Math.max(gridSize, (endY - startY) / maxLines)
    
    ctx.beginPath()
    for (let x = startX; x <= endX; x += stepX) {
      ctx.moveTo(x, bounds.minY)
      ctx.lineTo(x, bounds.maxY)
    }
    for (let y = startY; y <= endY; y += stepY) {
      ctx.moveTo(bounds.minX, y)
      ctx.lineTo(bounds.maxX, y)
    }
    ctx.stroke()
  }

  // Overlay com informações
  const renderOverlay = (
    ctx: CanvasRenderingContext2D, 
    data: DXFData, 
    transform: ViewTransform, 
    canvasWidth: number, 
    canvasHeight: number
  ) => {
    const info = [
      `Zoom: ${(transform.zoom * 100).toFixed(1)}%`,
      `Entidades: ${data.entities.length}`,
      `Layers: ${data.layers.length}`
    ]
    
    // Fundo branco semi-transparente
    const overlayHeight = info.length * 14 + 10
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(5, 5, 160, overlayHeight)
    
    // Borda
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1
    ctx.strokeRect(5, 5, 160, overlayHeight)
    
    // Texto
    ctx.fillStyle = "#333"
    ctx.font = "11px Arial"
    ctx.textAlign = "left"
    info.forEach((text, index) => {
      ctx.fillText(text, 10, 20 + index * 14)
    })
  }

  // Handlers de mouse
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y
    
    setTransform(prev => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY
    }))
    
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }, [isDragging, lastMousePos])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Toggle layer
  const toggleLayer = (layerName: string) => {
    setVisibleLayers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(layerName)) {
        newSet.delete(layerName)
      } else {
        newSet.add(layerName)
      }
      return newSet
    })
  }

  // Reset view
  const resetView = () => {
    if (dxfData) {
      const initialTransform = calculateInitialView(dxfData, canvasSize.width, canvasSize.height)
      setTransform(initialTransform)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 border border-red-200 rounded">
        <div className="text-center text-red-700">
          <p className="font-semibold">Erro ao carregar arquivo</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="border rounded cursor-crosshair w-full"
        style={{ 
          backgroundColor: "#ffffff",
          maxHeight: "60vh",
          minHeight: "400px",
          touchAction: "none"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando arquivo CAD...</p>
          </div>
        </div>
      )}
      
      {dxfData && (
        <div className="absolute top-3 right-3 bg-white bg-opacity-95 text-gray-800 text-xs p-3 rounded-lg shadow-lg border max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-blue-600">Controles CAD</span>
            <button
              onClick={resetView}
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium"
            >
              📐 Fit
            </button>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            <p className="font-semibold text-gray-700 mb-1">🔧 Layers:</p>
            {dxfData.layers.map(layer => (
              <label key={layer.name} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                <input
                  type="checkbox"
                  checked={visibleLayers.has(layer.name)}
                  onChange={() => toggleLayer(layer.name)}
                  className="w-3 h-3 accent-blue-500"
                />
                <span 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: ENTITY_COLORS[layer.name as keyof typeof ENTITY_COLORS] || "#2c3e50" }}
                ></span>
                <span className="text-xs truncate flex-1">{layer.name}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-3 pt-2 border-t text-xs text-gray-500">
            <p>💡 Scroll=Zoom | Drag=Pan</p>
          </div>
        </div>
      )}
    </div>
  )
}


