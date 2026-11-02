package br.com.user.controller;

import br.com.user.dto.*;
import br.com.user.service.GeminiService;
import br.com.user.service.CalculoFormaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@RestController
@RequestMapping("/api/v1/ia")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "IA", description = "Integração com Gemini AI para análise de plantas")
public class IAController {

    private final GeminiService geminiService;
    private final CalculoFormaService calculoFormaService;
    private final br.com.user.service.SvgGeneratorService svgGeneratorService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ResourceLoader resourceLoader;
    
    // Cache do PDF de exemplo em Base64
    private String pdfExemploBase64Cache = null;

    @PostMapping(value = "/analisar-planta", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Analisar planta com IA",
            description = "Recebe arquivos PDF das plantas e usa o Gemini AI para extrair dados arquitetônicos"
    )
    @ApiResponse(responseCode = "200", description = "Análise realizada com sucesso")
    @ApiResponse(responseCode = "400", description = "Arquivos inválidos")
    @ApiResponse(responseCode = "500", description = "Erro no processamento da IA")
    public ResponseEntity<AnalisePlantaResponseDTO> analisarPlanta(
            @RequestParam("structuralFile") MultipartFile structuralFile,
            @RequestParam(value = "architecturalFile", required = false) MultipartFile architecturalFile,
            @RequestParam(value = "electricalFile", required = false) MultipartFile electricalFile,
            @RequestParam(value = "projectName", required = false, defaultValue = "Projeto") String projectName,
            @RequestParam(value = "projectDescription", required = false) String projectDescription,
            @RequestParam(value = "additionalNotes", required = false) String additionalNotes
    ) {
        log.info("Iniciando análise de planta: {}", projectName);
        if (additionalNotes != null && !additionalNotes.isEmpty()) {
            log.info("Observações adicionais recebidas: {}", additionalNotes);
        }

        try {
            // Validar arquivo obrigatório
            if (structuralFile == null || structuralFile.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        AnalisePlantaResponseDTO.builder()
                                .success(false)
                                .status("error")
                                .message("A planta estrutural é obrigatória")
                                .build()
                );
            }

            // Converter arquivo para Base64
            String structuralBase64 = Base64.getEncoder().encodeToString(structuralFile.getBytes());
            
            // Detectar mimeType do arquivo
            String mimeType = structuralFile.getContentType();
            if (mimeType == null || mimeType.isEmpty()) {
                String filename = structuralFile.getOriginalFilename();
                if (filename != null && filename.toLowerCase().endsWith(".pdf")) {
                    mimeType = "application/pdf";
                } else {
                    mimeType = "image/jpeg";
                }
            }
            
            log.info("Arquivo estrutural convertido para Base64, tamanho: {} bytes, mimeType: {}", 
                    structuralFile.getSize(), mimeType);

            // Chamar o Gemini para análise (com observações adicionais se houver)
            String resultadoIA = geminiService.analisarPlanta(structuralBase64, mimeType, additionalNotes);
            
            log.info("Resultado da IA recebido: {}", resultadoIA.substring(0, Math.min(500, resultadoIA.length())));

            // Tentar parsear o resultado como PlantaDTO
            PlantaDTO plantaDTO = null;
            String jsonLimpo = resultadoIA.trim();
            
            try {
                // Limpar possíveis caracteres extras do JSON
                if (jsonLimpo.startsWith("```json")) {
                    jsonLimpo = jsonLimpo.substring(7);
                }
                if (jsonLimpo.startsWith("```")) {
                    jsonLimpo = jsonLimpo.substring(3);
                }
                if (jsonLimpo.endsWith("```")) {
                    jsonLimpo = jsonLimpo.substring(0, jsonLimpo.length() - 3);
                }
                jsonLimpo = jsonLimpo.trim();
                
                // Remover caracteres de controle que podem quebrar o parsing
                jsonLimpo = jsonLimpo.replaceAll("[\\x00-\\x1F]", " ");
                
                // Encontrar o início e fim do JSON válido
                int jsonStart = jsonLimpo.indexOf('{');
                int jsonEnd = jsonLimpo.lastIndexOf('}');
                if (jsonStart >= 0 && jsonEnd > jsonStart) {
                    jsonLimpo = jsonLimpo.substring(jsonStart, jsonEnd + 1);
                }
                
                log.info("JSON limpo para parsing: {}", jsonLimpo.substring(0, Math.min(500, jsonLimpo.length())));
                
                plantaDTO = objectMapper.readValue(jsonLimpo, PlantaDTO.class);
                if (plantaDTO.getNome() == null || plantaDTO.getNome().isEmpty()) {
                    plantaDTO.setNome(projectName);
                }
                log.info("PlantaDTO parseado com sucesso: {} cômodos", 
                        plantaDTO.getComodos() != null ? plantaDTO.getComodos().size() : 0);
            } catch (Exception e) {
                log.error("Erro ao parsear resultado como PlantaDTO: {}", e.getMessage());
                log.error("JSON original recebido: {}", resultadoIA);
                log.error("JSON limpo: {}", jsonLimpo);
                
                // Retornar erro se não conseguir parsear
                return ResponseEntity.ok(
                        AnalisePlantaResponseDTO.builder()
                                .success(false)
                                .status("parse_error")
                                .message("Erro ao interpretar resposta da IA. JSON recebido: " + 
                                        jsonLimpo.substring(0, Math.min(1000, jsonLimpo.length())))
                                .build()
                );
            }

            String projectId = "proj_" + System.currentTimeMillis();

            return ResponseEntity.ok(
                    AnalisePlantaResponseDTO.builder()
                            .success(true)
                            .projectId(projectId)
                            .status("completed")
                            .message("Análise concluída com sucesso!")
                            .plantaData(plantaDTO)
                            .build()
            );

        } catch (Exception e) {
            log.error("Erro ao analisar planta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                    AnalisePlantaResponseDTO.builder()
                            .success(false)
                            .status("error")
                            .message("Erro ao processar planta: " + e.getMessage())
                            .build()
            );
        }
    }

    @PostMapping("/calcular-cortes")
    @Operation(
            summary = "Calcular cortes das paredes (sem gerar imagens)",
            description = "Recebe os dados da planta e retorna os cálculos de cortes para validação pelo profissional"
    )
    @ApiResponse(responseCode = "200", description = "Cálculos realizados com sucesso")
    public ResponseEntity<PlantaCalculoDTO> calcularCortes(@RequestBody PlantaDTO plantaDTO) {
        log.info("Calculando cortes para planta: {}", plantaDTO.getNome());
        
        try {
            PlantaCalculoDTO resultado = calculoFormaService.calcularPlanta(plantaDTO);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            log.error("Erro ao calcular cortes: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/gerar-cortes")
    @Operation(
            summary = "Gerar cortes das paredes",
            description = "Recebe os dados validados da planta e gera os cortes de cada parede. useIA=true para IA, false para geração programática (padrão)"
    )
    @ApiResponse(responseCode = "200", description = "Cortes gerados com sucesso")
    public ResponseEntity<GerarCortesResponseDTO> gerarCortes(
            @RequestBody PlantaDTO plantaDTO,
            @RequestParam(value = "useIA", defaultValue = "false") boolean useIA) {
        
        log.info("Iniciando geração de cortes para planta: {} (useIA={})", plantaDTO.getNome(), useIA);

        try {
            List<CorteImagemDTO> cortesGerados = new ArrayList<>();
            int totalParedes = contarParedes(plantaDTO);
            int paredeAtual = 0;
            
            // Carregar PDF de exemplo apenas se for usar IA
            String pdfExemplo = useIA ? carregarPdfExemplo() : null;

            // Para cada cômodo e parede, calcular e gerar imagem de corte
            for (ComodoDTO comodo : plantaDTO.getComodos()) {
                for (ParedeDTO parede : comodo.getParedes()) {
                    paredeAtual++;
                    log.info("Processando parede {}/{}: {} do cômodo: {}", 
                            paredeAtual, totalParedes,
                            parede.getIdentificacaoParede(), comodo.getNomeComodo());

                    // Calcular placas para esta parede
                    List<ParedeDTO> paredeList = Collections.singletonList(parede);
                    List<CalculoPlacasDTO> calculos = calculoFormaService.calcularPlacasPorParedes(paredeList);

                    if (!calculos.isEmpty()) {
                        CalculoPlacasDTO calculo = calculos.get(0);
                        
                        String svgCorte;
                        
                        if (useIA) {
                            // === GERAÇÃO COM IA ===
                            Map<String, Object> dadosCorte = new LinkedHashMap<>();
                            dadosCorte.put("identificacaoParede", parede.getIdentificacaoParede());
                            dadosCorte.put("nomeComodo", comodo.getNomeComodo());
                            dadosCorte.put("comprimento", parede.getComprimento() != null ? parede.getComprimento() : 0);
                            dadosCorte.put("altura", parede.getAltura() != null ? parede.getAltura() : 0);
                            dadosCorte.put("largura", parede.getLargura() != null ? parede.getLargura() : 0.20);
                            
                            // Serializar o cálculo completo para a IA usando o DTO diretamente
                            Map<String, Object> calculoMap = new LinkedHashMap<>();
                            calculoMap.put("identificador", calculo.getIdentificador());
                            calculoMap.put("placasInteiras", calculo.getPlacasInteiras());
                            calculoMap.put("qtdPlacasCorteComprimento", calculo.getQtdPlacasCorteComprimento());
                            calculoMap.put("qtdPlacasCorteAltura", calculo.getQtdPlacasCorteAltura());
                            calculoMap.put("qtdPlacaCorteAlturaEComprimento", calculo.getQtdPlacaCorteAlturaEComprimento());
                            calculoMap.put("totalPlacas", calculo.getTotalPlacas());
                            
                            // Placa corte comprimento
                            if (calculo.getPlacaCorteComprimento() != null) {
                                Map<String, Object> corteComp = new LinkedHashMap<>();
                                corteComp.put("altura", calculo.getPlacaCorteComprimento().getAltura());
                                corteComp.put("comprimento", calculo.getPlacaCorteComprimento().getComprimento());
                                calculoMap.put("placaCorteComprimento", corteComp);
                            }
                            
                            // Placa corte altura
                            if (calculo.getPlacaCorteAltura() != null) {
                                Map<String, Object> corteAlt = new LinkedHashMap<>();
                                corteAlt.put("altura", calculo.getPlacaCorteAltura().getAltura());
                                corteAlt.put("comprimento", calculo.getPlacaCorteAltura().getComprimento());
                                calculoMap.put("placaCorteAltura", corteAlt);
                            }
                            
                            // Placas corte altura e comprimento (lista)
                            if (calculo.getPlacaCorteAlturaEComprimento() != null &&
                                    !calculo.getPlacaCorteAlturaEComprimento().isEmpty()) {
                                List<Map<String, Object>> cortes = calculo.getPlacaCorteAlturaEComprimento()
                                        .stream()
                                        .map(corte -> {
                                            Map<String, Object> m = new LinkedHashMap<>();
                                            m.put("altura", corte.getAltura());
                                            m.put("comprimento", corte.getComprimento());
                                            return m;
                                        })
                                        .toList();
                                calculoMap.put("placaCorteAlturaEComprimento", cortes);
                            }
                            
                            // Placas com recortes para aberturas (janelas/portas)
                            if (calculo.getPlacaCorteAlturaEComprimentoPosicaoY() != null) {
                                Map<String, Object> posicaoY = new LinkedHashMap<>();
                                posicaoY.put("qtdPlacas", calculo.getPlacaCorteAlturaEComprimentoPosicaoY().getQtdPlacas());
                                
                                if (calculo.getPlacaCorteAlturaEComprimentoPosicaoY().getPlacas() != null) {
                                    List<Map<String, Object>> placasRecorte = calculo.getPlacaCorteAlturaEComprimentoPosicaoY().getPlacas()
                                            .stream()
                                            .map(placa -> {
                                                Map<String, Object> pm = new LinkedHashMap<>();
                                                pm.put("numeroPlaca", placa.getNumeroPlaca());
                                                pm.put("larguraPlaca", placa.getLarguraPlaca());
                                                pm.put("alturaPlaca", placa.getAlturaPlaca());
                                                
                                                if (placa.getRecortes() != null) {
                                                    List<Map<String, Object>> recortes = placa.getRecortes()
                                                            .stream()
                                                            .map(r -> {
                                                                Map<String, Object> rm = new LinkedHashMap<>();
                                                                rm.put("largura", r.getLargura());
                                                                rm.put("altura", r.getAltura());
                                                                rm.put("posicaoX", r.getPosicaoX());
                                                                rm.put("posicaoY", r.getPosicaoY());
                                                                return rm;
                                                            })
                                                            .toList();
                                                    pm.put("recortes", recortes);
                                                }
                                                return pm;
                                            })
                                            .toList();
                                    posicaoY.put("placas", placasRecorte);
                                }
                                calculoMap.put("placaCorteAlturaEComprimentoPosicaoY", posicaoY);
                            }

                            dadosCorte.put("calculo", calculoMap);
                            String dadosCorteJson = objectMapper.writeValueAsString(dadosCorte);
                            
                            svgCorte = geminiService.gerarImagemCortes(dadosCorteJson, pdfExemplo);
                            
                            // Delay entre requisições para evitar rate limit
                            if (paredeAtual < totalParedes) {
                                Thread.sleep(1500);
                            }
                        } else {
                            // === GERAÇÃO PROGRAMÁTICA (Padrão SpeedFormas) ===
                            double comprimento = parede.getComprimento() != null ? parede.getComprimento().doubleValue() : 0.0;
                            double altura = parede.getAltura() != null ? parede.getAltura().doubleValue() : 280.0;
                            
                            svgCorte = svgGeneratorService.gerarSvgCorte(
                                parede.getIdentificacaoParede(),
                                comodo.getNomeComodo(),
                                comprimento,
                                altura,
                                calculo
                            );
                        }

                        // Calcular total de placas com corte
                        int placasComCorte = calculo.getQtdPlacasCorteComprimento()
                                + calculo.getQtdPlacasCorteAltura() 
                                + calculo.getQtdPlacaCorteAlturaEComprimento();
                        
                        // Obter sobras
                        double sobraLargura = 0.0;
                        double sobraAltura = 0.0;
                        if (calculo.getPlacaCorteComprimento() != null && calculo.getPlacaCorteComprimento().getComprimento() != null) {
                            sobraLargura = calculo.getPlacaCorteComprimento().getComprimento().doubleValue();
                        }
                        if (calculo.getPlacaCorteAltura() != null && calculo.getPlacaCorteAltura().getAltura() != null) {
                            sobraAltura = calculo.getPlacaCorteAltura().getAltura().doubleValue();
                        }

                        cortesGerados.add(CorteImagemDTO.builder()
                                .identificacao(parede.getIdentificacaoParede())
                                .nomeComodo(comodo.getNomeComodo())
                                .comprimento(parede.getComprimento() != null ? parede.getComprimento().doubleValue() : 0.0)
                                .altura(parede.getAltura() != null ? parede.getAltura().doubleValue() : 0.0)
                                .placasInteiras(calculo.getPlacasInteiras())
                                .placasComCorte(placasComCorte)
                                .svgCorte(svgCorte)
                                .sobraLargura(sobraLargura)
                                .sobraAltura(sobraAltura)
                                .totalPlacas(calculo.getTotalPlacas())
                                .build());
                        
                        log.info("Corte gerado com sucesso para parede: {}", parede.getIdentificacaoParede());
                    }
                }
            }

            String metodo = useIA ? "IA" : "padrão SpeedFormas";
            return ResponseEntity.ok(
                    GerarCortesResponseDTO.builder()
                            .success(true)
                            .message("Cortes gerados com sucesso (" + metodo + ") para " + cortesGerados.size() + " paredes")
                            .cortes(cortesGerados)
                            .build()
            );

        } catch (Exception e) {
            log.error("Erro ao gerar cortes: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(
                    GerarCortesResponseDTO.builder()
                            .success(false)
                            .message("Erro ao gerar cortes: " + e.getMessage())
                            .cortes(Collections.emptyList())
                            .build()
            );
        }
    }
    
    /**
     * Carrega o PDF de exemplo para servir de padrão visual
     */
    private String carregarPdfExemplo() {
        if (pdfExemploBase64Cache != null) {
            return pdfExemploBase64Cache;
        }
        
        try {
            // Tentar carregar do sistema de arquivos (caminho relativo ao projeto)
            Path pdfPath = Paths.get("exemplos/MÓDULO 14.pdf");
            if (Files.exists(pdfPath)) {
                byte[] pdfBytes = Files.readAllBytes(pdfPath);
                pdfExemploBase64Cache = Base64.getEncoder().encodeToString(pdfBytes);
                log.info("PDF de exemplo carregado com sucesso: {} bytes", pdfBytes.length);
                return pdfExemploBase64Cache;
            }
            
            // Tentar caminho alternativo (subindo um nível)
            pdfPath = Paths.get("../exemplos/MÓDULO 14.pdf");
            if (Files.exists(pdfPath)) {
                byte[] pdfBytes = Files.readAllBytes(pdfPath);
                pdfExemploBase64Cache = Base64.getEncoder().encodeToString(pdfBytes);
                log.info("PDF de exemplo carregado (caminho alternativo): {} bytes", pdfBytes.length);
                return pdfExemploBase64Cache;
            }
            
            // Tentar caminho absoluto comum
            pdfPath = Paths.get("C:/Users/davic/Downloads/speed-formas/exemplos/MÓDULO 14.pdf");
            if (Files.exists(pdfPath)) {
                byte[] pdfBytes = Files.readAllBytes(pdfPath);
                pdfExemploBase64Cache = Base64.getEncoder().encodeToString(pdfBytes);
                log.info("PDF de exemplo carregado (caminho absoluto): {} bytes", pdfBytes.length);
                return pdfExemploBase64Cache;
            }
            
            log.warn("PDF de exemplo não encontrado, gerando sem referência visual");
            return null;
            
        } catch (IOException e) {
            log.error("Erro ao carregar PDF de exemplo: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Conta o total de paredes na planta
     */
    private int contarParedes(PlantaDTO planta) {
        int total = 0;
        if (planta.getComodos() != null) {
            for (ComodoDTO comodo : planta.getComodos()) {
                if (comodo.getParedes() != null) {
                    total += comodo.getParedes().size();
                }
            }
        }
        return total;
    }
}
