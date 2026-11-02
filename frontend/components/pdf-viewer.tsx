"use client"

import React, { useRef, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  Download,
  Info,
  FileText,
  RotateCw
} from "lucide-react"

interface PdfViewerProps {
  file: File
  title: string
  className?: string
}

export function PdfViewer({ file, title, className }: PdfViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [zoom, setZoom] = useState(100)

  const fileUrl = URL.createObjectURL(file)

  const downloadFile = () => {
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const resetZoom = () => {
    setZoom(100)
  }

  return (
    <Card className={`${className} ${isFullscreen ? "fixed inset-4 z-50 bg-white shadow-2xl" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm" style={{ color: "#1f2539" }}>
              {title}
            </h4>
            <Badge variant="outline" className="text-xs">
              PDF
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {formatFileSize(file.size)}
            </Badge>
            <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
              ✅ Pronto para IA
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-xs px-2 py-1 bg-gray-100 rounded">
              {zoom}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 300}>
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetZoom}>
              <RotateCw className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowInfo(!showInfo)}
              title="Informações"
            >
              <Info className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadFile}
              title="Download"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {showInfo && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg text-xs border border-green-200">
            <p className="font-bold text-green-700 mb-2">📄 Arquivo PDF Carregado</p>
            <div className="grid grid-cols-2 gap-2 text-gray-700">
              <div><strong>Nome:</strong> {file.name}</div>
              <div><strong>Tamanho:</strong> {formatFileSize(file.size)}</div>
              <div><strong>Tipo:</strong> PDF</div>
              <div><strong>Status:</strong> ✅ Pronto para IA</div>
            </div>
            <div className="mt-2 pt-2 border-t border-green-200 text-xs text-green-600">
              <p><strong>💡 Vantagem PDF:</strong> A IA consegue interpretar plantas em PDF facilmente!</p>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="relative">
          <div 
            className="border rounded-lg bg-white overflow-hidden"
            style={{ 
              height: isFullscreen ? "calc(100vh - 200px)" : "600px",
              minHeight: "500px"
            }}
          >
            <embed
              src={fileUrl}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top left",
                width: `${(100 * 100) / zoom}%`,
                height: `${(100 * 100) / zoom}%`
              }}
              className="rounded"
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span>
              📄 <strong>PDF nativo:</strong> Zoom: {zoom}% | Controles na barra superior
            </span>
            <span className="text-green-600 font-medium">
              ✅ {file.name} • {formatFileSize(file.size)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


