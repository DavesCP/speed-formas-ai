export const config = {
  // Controle de modo mock/produção - FALSE para usar backend real
  useMock: false, // Integração com backend real ativa

  // URL da API do Backend Spring Boot
  apiUrl: "http://localhost:8085/api/v1", // Forçado para backend local
  
  // Configurações do Dify Workflow
  dify: {
    apiUrl: process.env.NEXT_PUBLIC_DIFY_API_URL || "https://api.dify.ai/v1/workflows/run",
    workflowId: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ID || "",
    apiKey: process.env.NEXT_PUBLIC_DIFY_API_KEY || "",
  },

  // Configurações de upload
  upload: {
    maxFileSizeMB: Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 50,
    allowedExtensions: process.env.NEXT_PUBLIC_ALLOWED_EXTENSIONS?.split(",") || [".pdf"],
  },

  // URLs da aplicação
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const

export type Config = typeof config
