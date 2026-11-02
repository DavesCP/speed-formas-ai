import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutDashboard, Users, FolderKanban, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total de Projetos",
      value: "24",
      icon: <FolderKanban className="h-8 w-8" style={{ color: "#d03034" }} />,
      description: "+3 este mês",
    },
    {
      title: "Usuários Ativos",
      value: "12",
      icon: <Users className="h-8 w-8" style={{ color: "#d03034" }} />,
      description: "2 novos esta semana",
    },
    {
      title: "Em Andamento",
      value: "8",
      icon: <LayoutDashboard className="h-8 w-8" style={{ color: "#d03034" }} />,
      description: "67% de conclusão",
    },
    {
      title: "Crescimento",
      value: "+15%",
      icon: <TrendingUp className="h-8 w-8" style={{ color: "#d03034" }} />,
      description: "vs. mês anterior",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "#1f2539" }}>
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Bem-vindo ao sistema Speedforma</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: "#1f2539" }}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle style={{ color: "#1f2539" }}>Atividades Recentes</CardTitle>
              <CardDescription>Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Novo projeto criado", time: "Há 2 horas", user: "João Silva" },
                  { action: "Usuário adicionado", time: "Há 5 horas", user: "Maria Santos" },
                  { action: "Projeto atualizado", time: "Há 1 dia", user: "Pedro Costa" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-2 w-2 rounded-full mt-2" style={{ backgroundColor: "#d03034" }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "#1f2539" }}>
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle style={{ color: "#1f2539" }}>Projetos em Destaque</CardTitle>
              <CardDescription>Principais projetos ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Edifício Residencial Centro", progress: 85, status: "Em andamento" },
                  { name: "Condomínio Jardim das Flores", progress: 60, status: "Em andamento" },
                  { name: "Torre Comercial Norte", progress: 40, status: "Iniciando" },
                ].map((project, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium" style={{ color: "#1f2539" }}>
                        {project.name}
                      </p>
                      <span className="text-xs text-gray-500">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%`, backgroundColor: "#d03034" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
