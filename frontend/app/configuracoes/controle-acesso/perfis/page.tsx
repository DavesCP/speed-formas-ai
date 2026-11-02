"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Construction, Wrench } from "lucide-react"

export default function PerfisPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#1f2539" }}>
            Perfis de Acesso
          </h1>
          <p className="text-gray-600 mt-1">Gerencie perfis e permissões do sistema</p>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div 
              className="h-20 w-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "#fef3c7" }}
            >
              <Construction className="h-10 w-10" style={{ color: "#d97706" }} />
            </div>
            
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#1f2539" }}>
              Em Desenvolvimento
            </h2>
            
            <p className="text-gray-500 text-center max-w-md mb-6">
              Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
              Aguarde as próximas atualizações do sistema.
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Wrench className="h-4 w-4" />
              <span>Previsão: Em breve</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
