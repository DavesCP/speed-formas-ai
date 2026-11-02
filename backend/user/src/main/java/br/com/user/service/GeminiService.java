package br.com.user.service;

public interface GeminiService {
    
    /**
     * Analisa uma planta estrutural usando a API do Gemini
     * @param plantaBase64 Imagem/PDF da planta em Base64
     * @param mimeType Tipo MIME do arquivo (ex: "image/jpeg", "application/pdf")
     * @param additionalNotes Observações adicionais do usuário para incluir no prompt (pode ser null)
     * @return JSON com os dados extraídos
     */
    String analisarPlanta(String plantaBase64, String mimeType, String additionalNotes);
    
    /**
     * Gera descrição/imagem de cortes para uma parede
     * @param dadosCorteJson JSON com os dados da parede e cálculo de placas
     * @param pdfExemploBase64 PDF de exemplo em Base64 para servir de padrão visual (pode ser null)
     * @return Código SVG ou descrição do corte gerado
     */
    String gerarImagemCortes(String dadosCorteJson, String pdfExemploBase64);
}
