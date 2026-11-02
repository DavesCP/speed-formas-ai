"use client"

import React from "react"
import { PdfViewer } from "@/components/pdf-viewer"

interface DwgViewerProps {
  file: File
  title: string
  className?: string
}

export function DwgViewer({ file, title, className }: DwgViewerProps) {
  // Agora usa visualizador PDF simples e eficaz
  return (
    <PdfViewer 
      file={file} 
      title={title} 
      className={className} 
    />
  )
}
