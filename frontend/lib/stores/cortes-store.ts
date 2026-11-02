// Store global simples para dados de cortes (evita limite do sessionStorage)
import { GerarCortesResponse } from "@/lib/services/ai-service"

let cortesData: GerarCortesResponse | null = null

export const cortesStore = {
  set: (data: GerarCortesResponse) => {
    cortesData = data
  },
  
  get: (): GerarCortesResponse | null => {
    return cortesData
  },
  
  clear: () => {
    cortesData = null
  }
}


