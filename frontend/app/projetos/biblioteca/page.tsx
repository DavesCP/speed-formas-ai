"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Library, Plus, Upload } from "lucide-react"

export default function BibliotecaPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "#1f2539" }}>
              Biblioteca de Projetos 2D
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie projetos 2D que podem ser utilizados como base para novos projetos
            </p>
          </div>
          <Button disabled className="font-semibold" style={{ backgroundColor: "#d03034", color: "#ffffff" }}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar à Biblioteca
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="py-24 text-center">
            <div
              className="h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: "#f3f4f6" }}
            >
              <Library className="h-10 w-10" style={{ color: "#d03034" }} />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ color: "#1f2539" }}>
              Biblioteca de Projetos 2D
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Esta seção armazenará projetos 2D que poderão ser utilizados como base ou referência ao criar novos
              projetos. Você poderá fazer upload de arquivos DWG, organizá-los por categorias e reutilizá-los em
              diferentes projetos da empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button disabled variant="outline" className="gap-2 bg-transparent">
                <Upload className="h-4 w-4" />
                Fazer Upload de Projeto 2D
              </Button>
              <Button disabled variant="outline" className="gap-2 bg-transparent">
                <Library className="h-4 w-4" />
                Explorar Biblioteca
              </Button>
            </div>
            <div className="mt-8 pt-8 border-t max-w-xl mx-auto">
              <p className="text-sm text-gray-500">
                <strong>Funcionalidade em desenvolvimento.</strong> Em breve você poderá gerenciar sua biblioteca
                completa de projetos 2D diretamente por aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
