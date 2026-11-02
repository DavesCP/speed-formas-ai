package br.com.user.service.impl;

import br.com.user.service.GeminiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiServiceImpl implements GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String PROMPT_ANALISE_PLANTA = """
        VOCÊ É UM ANALISADOR ESPECIALISTA DE PLANTAS BAIXAS. Extraia os dados e retorne APENAS um JSON válido e COMPLETO.
        
        REGRA CRÍTICA DE UNIDADE DE MEDIDA:
        - SEMPRE retorne os valores em METROS (m), nunca em centímetros.
        - Se a planta mostrar valores em cm, CONVERTA para metros (divida por 100).
        - Exemplos: 170cm -> 1.70, 260cm -> 2.60, 20cm -> 0.20, 90cm -> 0.90
        - O campo "unidadeMedida" deve ser SEMPRE "m" (metros).
        
        POSICIONAMENTO DE PORTAS E JANELAS (MUITO IMPORTANTE - CALCULE CORRETAMENTE):
        - posicaoX: Distância do INÍCIO ESQUERDO da parede até o INÍCIO da porta/janela
        - posicaoY: Distância do INÍCIO ESQUERDO da parede até o FIM da porta/janela
        - posicaoSolo (apenas janelas): Altura do CHÃO até a PARTE INFERIOR da janela
        
        FÓRMULA OBRIGATÓRIA PARA CALCULAR posicaoY:
        posicaoY = posicaoX + comprimento_abertura
        
        EXEMPLO 1 - Porta:
        Parede de 2.7m, porta de 1.0m, posicaoX = 0.5m
        posicaoY = 0.5 + 1.0 = 1.5m
        ┌─────────────────────────────┐
        │←0.5→│← PORTA 1.0m →│← 1.2m →│
        │     │              │        │
        │     posicaoX=0.5   posicaoY=1.5
        └─────────────────────────────┘
        
        EXEMPLO 2 - Janela:
        Parede de 4.4m, janela de 1.2m, posicaoX = 1.6m
        posicaoY = 1.6 + 1.2 = 2.8m
        ┌────────────────────────────────────────┐
        │←─1.6m─→│← JANELA 1.2m →│←─ 1.6m ──→│
        │        │               │            │
        │        posicaoX=1.6    posicaoY=2.8
        └────────────────────────────────────────┘
        
        ESTRUTURA JSON OBRIGATÓRIA (copie EXATAMENTE esta estrutura):
        {
          "nome": "Nome da Planta",
          "unidadeMedida": "m",
          "comodos": [
            {
              "nomeComodo": "COZINHA",
              "paredes": [
                {
                  "identificacaoParede": "p1",
                  "altura": 2.80,
                  "largura": 0.20,
                  "comprimento": 2.70,
                  "quantidadeLP": 2,
                  "portas": [],
                  "janelas": []
                },
                {
                  "identificacaoParede": "p2",
                  "altura": 2.80,
                  "largura": 0.20,
                  "comprimento": 2.70,
                  "quantidadeLP": 1,
                  "portas": [
                    {
                      "altura": 2.10,
                      "comprimento": 1.00,
                      "posicaoX": 0.50,
                      "posicaoY": 1.50
                    }
                  ],
                  "janelas": []
                },
                {
                  "identificacaoParede": "p3",
                  "altura": 2.80,
                  "largura": 0.20,
                  "comprimento": 4.40,
                  "quantidadeLP": 0,
                  "portas": [],
                  "janelas": [
                    {
                      "altura": 1.20,
                      "comprimento": 1.20,
                      "posicaoX": 1.60,
                      "posicaoY": 2.80,
                      "posicaoSolo": 1.00
                    }
                  ]
                }
              ]
            }
          ]
        }
        
        REGRAS IMPORTANTES:
        1. Cada parede DEVE ter os campos: identificacaoParede, altura, largura, comprimento, quantidadeLP, portas, janelas
        2. "portas" e "janelas" são ARRAYS (sempre [], mesmo se vazios)
        3. Para portas: altura, comprimento, posicaoX, posicaoY (todos em metros)
        4. Para janelas: altura, comprimento, posicaoX, posicaoY, posicaoSolo (todos em metros)
        5. VALIDAR: posicaoX + comprimento_abertura + posicaoY = comprimento_parede
        6. LP (Limites Puras): Identifique "LP" nos cantos. quantidadeLP pode ser 0, 1 ou 2
        7. Todos os valores numéricos em METROS
        
        CRÍTICO: Retorne APENAS o JSON válido e COMPLETO. NÃO inclua markdown (```), NÃO inclua explicações, APENAS o JSON puro.
        O JSON deve estar completo com todos os fechamentos de chaves e colchetes.
        """;

    @Override
    public String analisarPlanta(String plantaBase64, String mimeType, String additionalNotes) {
        log.info("Iniciando análise de planta com Gemini AI, mimeType: {}", mimeType);
        
        try {
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            
            // Montar prompt com observações adicionais se existirem
            String promptFinal = PROMPT_ANALISE_PLANTA;
            if (additionalNotes != null && !additionalNotes.trim().isEmpty()) {
                promptFinal = PROMPT_ANALISE_PLANTA + "\n\nOBSERVAÇÕES ADICIONAIS DO USUÁRIO (considere essas informações na análise):\n" + additionalNotes;
                log.info("Observações adicionais incluídas no prompt: {}", additionalNotes);
            }
            
            // Parte de texto (prompt)
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", promptFinal);
            parts.add(textPart);
            
            // Parte de imagem/PDF
            Map<String, Object> imagePart = new HashMap<>();
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", mimeType);
            inlineData.put("data", plantaBase64);
            imagePart.put("inline_data", inlineData);
            parts.add(imagePart);
            
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);
            
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.2);
            generationConfig.put("maxOutputTokens", 1000000);
            requestBody.put("generationConfig", generationConfig);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("Enviando request para Gemini API: {}", apiUrl);
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Resposta recebida com sucesso do Gemini");
                return extrairTextoResposta(response.getBody());
            } else {
                log.error("Erro na resposta do Gemini: {}", response.getStatusCode());
                throw new RuntimeException("Erro na API do Gemini: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Erro ao analisar planta com Gemini: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao processar planta com IA: " + e.getMessage(), e);
        }
    }

    @Override
    public String gerarImagemCortes(String dadosCorteJson, String pdfExemploBase64) {
        log.info("Gerando imagem de cortes com Gemini AI");
        
        try {
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            
            // Primeiro: PDF de exemplo como referência visual (se disponível)
            if (pdfExemploBase64 != null && !pdfExemploBase64.isEmpty()) {
                Map<String, Object> pdfPart = new HashMap<>();
                Map<String, Object> pdfData = new HashMap<>();
                pdfData.put("mime_type", "application/pdf");
                pdfData.put("data", pdfExemploBase64);
                pdfPart.put("inline_data", pdfData);
                parts.add(pdfPart);
                log.info("PDF de exemplo anexado à requisição");
            }
            
            // Segundo: Prompt detalhado para copiar EXATAMENTE o padrão do documento
            String promptCortes = """
                VOCÊ DEVE GERAR UM SVG TÉCNICO QUE SEJA UMA CÓPIA EXATA DO DOCUMENTO PDF DE EXEMPLO ANEXADO.
                
                ANALISE O PDF ANEXADO COM EXTREMA ATENÇÃO E REPLIQUE:
                - O MESMO LAYOUT EXATO do documento
                - AS MESMAS CORES EXATAS (extraia os códigos hex do PDF)
                - A MESMA ESTRUTURA de 4 seções lado a lado
                - OS MESMOS ESTILOS de fonte, bordas e espaçamento
                - AS MESMAS LEGENDAS e formato de texto
                
                DADOS DA PAREDE PARA PREENCHER NO SVG (JSON):
                %s
                
                ESTRUTURA DO JSON RECEBIDO:
                - identificacaoParede: identificador da parede (ex: p1, p2)
                - nomeComodo: nome do cômodo (ex: COZINHA, QUARTO)
                - comprimento: comprimento da parede em metros
                - altura: altura da parede em metros
                - calculo: objeto com os cálculos das placas:
                  - placasInteiras: quantidade de placas inteiras (sem corte)
                  - qtdPlacasCorteComprimento: quantidade de placas com corte só no comprimento
                  - placaCorteComprimento: {altura, comprimento} - dimensões do corte
                  - qtdPlacasCorteAltura: quantidade de placas com corte só na altura
                  - placaCorteAltura: {altura, comprimento} - dimensões do corte
                  - qtdPlacaCorteAlturaEComprimento: quantidade de placas com corte em ambos
                  - placaCorteAlturaEComprimento: lista de {altura, comprimento}
                  - placaCorteAlturaEComprimentoPosicaoY: placas com recortes para JANELAS/PORTAS
                    - qtdPlacas: quantidade de placas afetadas
                    - placas: lista de placas com recortes:
                      - numeroPlaca: número da placa
                      - larguraPlaca, alturaPlaca: dimensões da placa
                      - recortes: lista de {largura, altura, posicaoX, posicaoY} para cada abertura
                  - totalPlacas: total de placas necessárias
                
                O DOCUMENTO PDF MOSTRA O PADRÃO COM 4 COLUNAS:
                1. CHAPA INTERNA (madeirite interno) - primeira coluna
                2. CHAPA EXTERNA (madeirite externo) - segunda coluna  
                3. EPS (isopor/poliestireno) - terceira coluna
                4. PAREDE MONTADA (sandwich completo) - quarta coluna
                
                INSTRUÇÕES CRÍTICAS:
                1. COPIE EXATAMENTE as cores do PDF - não invente cores diferentes
                2. COPIE EXATAMENTE o layout de 4 colunas do PDF
                3. COPIE EXATAMENTE as legendas e textos no mesmo formato do PDF
                4. COPIE EXATAMENTE as cotas e dimensões no mesmo estilo do PDF
                5. Use viewBox="0 0 1200 600" para ter espaço para as 4 colunas
                6. Cada coluna deve ter aproximadamente 280px de largura
                7. SE houver "placaCorteAlturaEComprimentoPosicaoY", desenhe os RECORTES nas placas (janelas/portas)
                
                AS PLACAS TÊM:
                - Dimensão padrão: 1.10m x 2.20m (110cm x 220cm)
                - Mostre numeração (1, 2, 3...) no centro de cada placa
                - Placas com corte devem ter linha tracejada vermelha indicando onde cortar
                - Placas com RECORTES (para janelas/portas) devem mostrar o buraco na posição correta
                
                RETORNE APENAS o código SVG válido, começando com <svg e terminando com </svg>.
                NÃO inclua explicações, apenas o SVG puro.
                """.formatted(dadosCorteJson);
            
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", promptCortes);
            parts.add(textPart);
            
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);
            
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", 0.2);
            generationConfig.put("maxOutputTokens", 1000000);
            requestBody.put("generationConfig", generationConfig);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            log.info("Enviando request para gerar cortes com Gemini...");
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Imagem de corte gerada com sucesso");
                return extrairTextoResposta(response.getBody());
            } else {
                log.error("Erro na resposta do Gemini: {}", response.getStatusCode());
                throw new RuntimeException("Erro na API do Gemini: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Erro ao gerar cortes com Gemini: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao gerar cortes com IA: " + e.getMessage(), e);
        }
    }
    
    /**
     * Extrai o texto da resposta do Gemini
     */
    private String extrairTextoResposta(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                
                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText();
                    // Limpar markdown se presente
                    text = text.replaceAll("```svg\\n?", "").replaceAll("```xml\\n?", "")
                              .replaceAll("```json\\n?", "").replaceAll("```\\n?", "").trim();
                    return text;
                }
            }
            
            log.warn("Estrutura de resposta inesperada do Gemini");
            return responseBody;
            
        } catch (Exception e) {
            log.error("Erro ao parsear resposta do Gemini: {}", e.getMessage());
            return responseBody;
        }
    }
}
