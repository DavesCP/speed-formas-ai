package br.com.user.service.impl;

import br.com.user.dto.CalculoPlacasDTO;
import br.com.user.service.SvgGeneratorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Gerador de SVG programático seguindo o padrão exato do documento SpeedFormas
 */
@Service
@Slf4j
public class SvgGeneratorServiceImpl implements SvgGeneratorService {

    // Dimensões padrão das placas em cm
    private static final double LARGURA_PLACA = 110.0;
    private static final double ALTURA_PLACA = 220.0;
    
    // Cores do padrão SpeedFormas (baseado no documento)
    private static final String COR_MADEIRITE = "#C8A86B";      // Bege/madeira
    private static final String COR_EPS = "#F0F0F0";            // Cinza claro (isopor)
    private static final String COR_PAREDE = "#D4B896";         // Parede montada
    private static final String COR_CORTE = "#FF0000";          // Linha de corte vermelha
    private static final String COR_TEXTO = "#333333";          // Texto
    private static final String COR_COTA = "#000000";           // Cotas
    private static final String COR_FUNDO = "#FFFFFF";          // Fundo branco

    @Override
    public String gerarSvgCorte(
            String identificacaoParede,
            String nomeComodo,
            double comprimento,
            double altura,
            CalculoPlacasDTO calculo
    ) {
        log.info("Gerando SVG para parede {} - {}", identificacaoParede, nomeComodo);
        
        // Dimensões do SVG
        int svgWidth = 800;
        int svgHeight = 600;
        int marginTop = 80;
        int marginLeft = 60;
        int marginRight = 40;
        int marginBottom = 120;
        
        int areaWidth = svgWidth - marginLeft - marginRight;
        int areaHeight = svgHeight - marginTop - marginBottom;
        
        // Calcular escala
        double escalaX = areaWidth / comprimento;
        double escalaY = areaHeight / altura;
        double escala = Math.min(escalaX, escalaY) * 0.9;
        
        // Dimensões escaladas
        double paredeWidth = comprimento * escala;
        double paredeHeight = altura * escala;
        double placaWidth = LARGURA_PLACA * escala;
        double placaHeight = ALTURA_PLACA * escala;
        
        // Posição inicial
        double startX = marginLeft + (areaWidth - paredeWidth) / 2;
        double startY = marginTop;
        
        StringBuilder svg = new StringBuilder();
        
        // Início do SVG
        svg.append(String.format(
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 %d %d\" width=\"%d\" height=\"%d\">\n",
            svgWidth, svgHeight, svgWidth, svgHeight
        ));
        
        // Definições (gradientes, patterns)
        svg.append("<defs>\n");
        // Pattern para madeirite (linhas de madeira)
        svg.append("  <pattern id=\"madeirite\" patternUnits=\"userSpaceOnUse\" width=\"20\" height=\"4\">\n");
        svg.append("    <rect width=\"20\" height=\"4\" fill=\"" + COR_MADEIRITE + "\"/>\n");
        svg.append("    <line x1=\"0\" y1=\"2\" x2=\"20\" y2=\"2\" stroke=\"#B89A5A\" stroke-width=\"0.5\"/>\n");
        svg.append("  </pattern>\n");
        // Pattern para EPS (pontilhado)
        svg.append("  <pattern id=\"eps\" patternUnits=\"userSpaceOnUse\" width=\"8\" height=\"8\">\n");
        svg.append("    <rect width=\"8\" height=\"8\" fill=\"" + COR_EPS + "\"/>\n");
        svg.append("    <circle cx=\"4\" cy=\"4\" r=\"1\" fill=\"#E0E0E0\"/>\n");
        svg.append("  </pattern>\n");
        svg.append("</defs>\n");
        
        // Fundo
        svg.append(String.format("<rect width=\"%d\" height=\"%d\" fill=\"%s\"/>\n", 
            svgWidth, svgHeight, COR_FUNDO));
        
        // === CABEÇALHO ===
        svg.append(String.format(
            "<text x=\"%d\" y=\"30\" font-family=\"Arial, sans-serif\" font-size=\"18\" font-weight=\"bold\" fill=\"%s\">CORTE DE PAREDE - %s</text>\n",
            svgWidth / 2 - 100, COR_TEXTO, nomeComodo.toUpperCase()
        ));
        svg.append(String.format(
            "<text x=\"%d\" y=\"55\" font-family=\"Arial, sans-serif\" font-size=\"14\" fill=\"%s\">Parede %s | Dimensões: %.0f cm x %.0f cm</text>\n",
            svgWidth / 2 - 120, COR_TEXTO, identificacaoParede.toUpperCase(), comprimento, altura
        ));
        
        // === DESENHO DAS 4 REPRESENTAÇÕES ===
        double secaoWidth = paredeWidth / 4 - 10;
        double secaoX = startX;
        
        // 1. CHAPA INTERNA (Madeirite)
        svg.append(gerarSecaoChapa(secaoX, startY, secaoWidth, paredeHeight, 
            "CHAPA INTERNA", "url(#madeirite)", calculo, true, placaWidth, placaHeight));
        
        // 2. CHAPA EXTERNA (Madeirite)
        secaoX += secaoWidth + 15;
        svg.append(gerarSecaoChapa(secaoX, startY, secaoWidth, paredeHeight, 
            "CHAPA EXTERNA", "url(#madeirite)", calculo, true, placaWidth, placaHeight));
        
        // 3. EPS
        secaoX += secaoWidth + 15;
        svg.append(gerarSecaoEPS(secaoX, startY, secaoWidth, paredeHeight, calculo, placaWidth, placaHeight));
        
        // 4. PAREDE MONTADA
        secaoX += secaoWidth + 15;
        svg.append(gerarSecaoParedeMontada(secaoX, startY, secaoWidth, paredeHeight, calculo, placaWidth, placaHeight));
        
        // === LEGENDA ===
        int legendaY = svgHeight - 100;
        
        // Quadro de legenda
        svg.append(String.format(
            "<rect x=\"%d\" y=\"%d\" width=\"%d\" height=\"90\" fill=\"#FAFAFA\" stroke=\"#CCCCCC\" rx=\"5\"/>\n",
            marginLeft, legendaY, svgWidth - marginLeft - marginRight
        ));
        
        svg.append(String.format(
            "<text x=\"%d\" y=\"%d\" font-family=\"Arial\" font-size=\"12\" font-weight=\"bold\" fill=\"%s\">RESUMO DE MATERIAIS</text>\n",
            marginLeft + 10, legendaY + 20, COR_TEXTO
        ));
        
        // Placas inteiras
        svg.append(String.format(
            "<rect x=\"%d\" y=\"%d\" width=\"15\" height=\"15\" fill=\"%s\" stroke=\"#333\"/>\n",
            marginLeft + 10, legendaY + 30, COR_MADEIRITE
        ));
        svg.append(String.format(
            "<text x=\"%d\" y=\"%d\" font-family=\"Arial\" font-size=\"11\" fill=\"%s\">Placas inteiras: %d unidades</text>\n",
            marginLeft + 30, legendaY + 42, COR_TEXTO, calculo.getPlacasInteiras()
        ));
        
        // Placas com corte
        int placasComCorte = calculo.getQtdPlacasCorteComprimento() + calculo.getQtdPlacasCorteAltura() + calculo.getQtdPlacaCorteAlturaEComprimento();
        svg.append(String.format(
            "<rect x=\"%d\" y=\"%d\" width=\"15\" height=\"15\" fill=\"#FDE68A\" stroke=\"#333\"/>\n",
            marginLeft + 10, legendaY + 50
        ));
        svg.append(String.format(
            "<text x=\"%d\" y=\"%d\" font-family=\"Arial\" font-size=\"11\" fill=\"%s\">Placas com corte: %d unidades</text>\n",
            marginLeft + 30, legendaY + 62, COR_TEXTO, placasComCorte
        ));
        
        // Total
        svg.append(String.format(
            "<text x=\"%d\" y=\"%d\" font-family=\"Arial\" font-size=\"12\" font-weight=\"bold\" fill=\"%s\">TOTAL: %d placas</text>\n",
            marginLeft + 10, legendaY + 82, COR_CORTE, calculo.getTotalPlacas()
        ));
        
        // Dimensões de corte (se houver)
        int infoX = marginLeft + 250;
        if (calculo.getPlacaCorteComprimento() != null) {
            svg.append(String.format(
                "<text x=\"%d\" y=\"%d\" font-family=\"Arial\" font-size=\"10\" fill=\"%s\">Corte largura: %.1f cm x %.1f cm</text>\n",
                infoX, legendaY + 42, COR_TEXTO,
                calculo.getPlacaCorteComprimento().getComprimento().doubleValue(),
                calculo.getPlacaCorteComprimento().getAltura().doubleValue()
            ));
        }
        if (calculo.getPlacaCorteAltura() != null) {
            svg.append(String.format(
                "<text x=\"%d\" y=\"%d\" font-family=\"Arial\" font-size=\"10\" fill=\"%s\">Corte altura: %.1f cm x %.1f cm</text>\n",
                infoX, legendaY + 56, COR_TEXTO,
                calculo.getPlacaCorteAltura().getComprimento().doubleValue(),
                calculo.getPlacaCorteAltura().getAltura().doubleValue()
            ));
        }
        
        // Fim do SVG
        svg.append("</svg>");
        
        return svg.toString();
    }
    
    private String gerarSecaoChapa(double x, double y, double width, double height, 
            String titulo, String fill, CalculoPlacasDTO calculo, 
            boolean mostrarCortes, double placaWidth, double placaHeight) {
        
        StringBuilder sb = new StringBuilder();
        
        // Título da seção
        sb.append(String.format(
            "<text x=\"%.1f\" y=\"%.1f\" font-family=\"Arial\" font-size=\"10\" font-weight=\"bold\" fill=\"%s\" text-anchor=\"middle\">%s</text>\n",
            x + width/2, y - 5, COR_TEXTO, titulo
        ));
        
        // Contorno da área
        sb.append(String.format(
            "<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"none\" stroke=\"#999\" stroke-dasharray=\"3,3\"/>\n",
            x, y, width, height
        ));
        
        // Desenhar placas
        double escalaSecao = Math.min(width / (LARGURA_PLACA * 2.5), height / ALTURA_PLACA) * 0.85;
        double pWidth = LARGURA_PLACA * escalaSecao;
        double pHeight = ALTURA_PLACA * escalaSecao;
        
        int numPlacas = calculo.getTotalPlacas();
        int colunas = (int) Math.ceil(Math.sqrt(numPlacas * 0.5));
        int linhas = (int) Math.ceil((double) numPlacas / colunas);
        
        double offsetX = (width - colunas * (pWidth + 5)) / 2;
        double offsetY = (height - linhas * (pHeight + 5)) / 2;
        
        int placaNum = 0;
        for (int row = 0; row < linhas && placaNum < numPlacas; row++) {
            for (int col = 0; col < colunas && placaNum < numPlacas; col++) {
                double px = x + offsetX + col * (pWidth + 5);
                double py = y + offsetY + row * (pHeight + 5);
                
                boolean isCorte = placaNum >= calculo.getPlacasInteiras();
                String placaFill = isCorte ? "#FDE68A" : fill;
                
                sb.append(String.format(
                    "<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"%s\" stroke=\"#333\" stroke-width=\"1\"/>\n",
                    px, py, pWidth, pHeight, placaFill
                ));
                
                // Número da placa
                sb.append(String.format(
                    "<text x=\"%.1f\" y=\"%.1f\" font-family=\"Arial\" font-size=\"9\" fill=\"#333\" text-anchor=\"middle\">%d</text>\n",
                    px + pWidth/2, py + pHeight/2 + 3, placaNum + 1
                ));
                
                // Linha de corte se necessário
                if (isCorte && mostrarCortes) {
                    sb.append(String.format(
                        "<line x1=\"%.1f\" y1=\"%.1f\" x2=\"%.1f\" y2=\"%.1f\" stroke=\"%s\" stroke-width=\"2\" stroke-dasharray=\"5,3\"/>\n",
                        px + pWidth * 0.7, py, px + pWidth * 0.7, py + pHeight, COR_CORTE
                    ));
                }
                
                placaNum++;
            }
        }
        
        return sb.toString();
    }
    
    private String gerarSecaoEPS(double x, double y, double width, double height, 
            CalculoPlacasDTO calculo, double placaWidth, double placaHeight) {
        
        StringBuilder sb = new StringBuilder();
        
        // Título
        sb.append(String.format(
            "<text x=\"%.1f\" y=\"%.1f\" font-family=\"Arial\" font-size=\"10\" font-weight=\"bold\" fill=\"%s\" text-anchor=\"middle\">EPS (ISOPOR)</text>\n",
            x + width/2, y - 5, COR_TEXTO
        ));
        
        // Contorno
        sb.append(String.format(
            "<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"none\" stroke=\"#999\" stroke-dasharray=\"3,3\"/>\n",
            x, y, width, height
        ));
        
        // EPS usa o mesmo layout das placas
        double escalaSecao = Math.min(width / (LARGURA_PLACA * 2.5), height / ALTURA_PLACA) * 0.85;
        double pWidth = LARGURA_PLACA * escalaSecao;
        double pHeight = ALTURA_PLACA * escalaSecao;
        
        int numPlacas = calculo.getTotalPlacas();
        int colunas = (int) Math.ceil(Math.sqrt(numPlacas * 0.5));
        int linhas = (int) Math.ceil((double) numPlacas / colunas);
        
        double offsetX = (width - colunas * (pWidth + 5)) / 2;
        double offsetY = (height - linhas * (pHeight + 5)) / 2;
        
        int placaNum = 0;
        for (int row = 0; row < linhas && placaNum < numPlacas; row++) {
            for (int col = 0; col < colunas && placaNum < numPlacas; col++) {
                double px = x + offsetX + col * (pWidth + 5);
                double py = y + offsetY + row * (pHeight + 5);
                
                boolean isCorte = placaNum >= calculo.getPlacasInteiras();
                
                sb.append(String.format(
                    "<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"url(#eps)\" stroke=\"#AAA\" stroke-width=\"1\"/>\n",
                    px, py, pWidth, pHeight
                ));
                
                // Número
                sb.append(String.format(
                    "<text x=\"%.1f\" y=\"%.1f\" font-family=\"Arial\" font-size=\"9\" fill=\"#666\" text-anchor=\"middle\">%d</text>\n",
                    px + pWidth/2, py + pHeight/2 + 3, placaNum + 1
                ));
                
                if (isCorte) {
                    sb.append(String.format(
                        "<line x1=\"%.1f\" y1=\"%.1f\" x2=\"%.1f\" y2=\"%.1f\" stroke=\"%s\" stroke-width=\"2\" stroke-dasharray=\"5,3\"/>\n",
                        px + pWidth * 0.7, py, px + pWidth * 0.7, py + pHeight, COR_CORTE
                    ));
                }
                
                placaNum++;
            }
        }
        
        return sb.toString();
    }
    
    private String gerarSecaoParedeMontada(double x, double y, double width, double height, 
            CalculoPlacasDTO calculo, double placaWidth, double placaHeight) {
        
        StringBuilder sb = new StringBuilder();
        
        // Título
        sb.append(String.format(
            "<text x=\"%.1f\" y=\"%.1f\" font-family=\"Arial\" font-size=\"10\" font-weight=\"bold\" fill=\"%s\" text-anchor=\"middle\">PAREDE MONTADA</text>\n",
            x + width/2, y - 5, COR_TEXTO
        ));
        
        // Contorno
        sb.append(String.format(
            "<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"none\" stroke=\"#999\" stroke-dasharray=\"3,3\"/>\n",
            x, y, width, height
        ));
        
        // Parede montada mostra as 3 camadas juntas
        double escalaSecao = Math.min(width / (LARGURA_PLACA * 2.5), height / ALTURA_PLACA) * 0.85;
        double pWidth = LARGURA_PLACA * escalaSecao;
        double pHeight = ALTURA_PLACA * escalaSecao;
        
        int numPlacas = calculo.getTotalPlacas();
        int colunas = (int) Math.ceil(Math.sqrt(numPlacas * 0.5));
        int linhas = (int) Math.ceil((double) numPlacas / colunas);
        
        double offsetX = (width - colunas * (pWidth + 5)) / 2;
        double offsetY = (height - linhas * (pHeight + 5)) / 2;
        
        int placaNum = 0;
        for (int row = 0; row < linhas && placaNum < numPlacas; row++) {
            for (int col = 0; col < colunas && placaNum < numPlacas; col++) {
                double px = x + offsetX + col * (pWidth + 5);
                double py = y + offsetY + row * (pHeight + 5);
                
                // Desenhar as 3 camadas sobrepostas (efeito 3D)
                double offset3d = 3;
                
                // Camada de trás (chapa interna)
                sb.append(String.format(
                    "<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"%s\" stroke=\"#333\" stroke-width=\"0.5\"/>\n",
                    px + offset3d * 2, py - offset3d * 2, pWidth, pHeight, COR_MADEIRITE
                ));
                
                // Camada do meio (EPS)
                sb.append(String.format(
                    "<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"%s\" stroke=\"#999\" stroke-width=\"0.5\"/>\n",
                    px + offset3d, py - offset3d, pWidth, pHeight, COR_EPS
                ));
                
                // Camada da frente (chapa externa)
                boolean isCorte = placaNum >= calculo.getPlacasInteiras();
                String corFrente = isCorte ? "#FDE68A" : COR_MADEIRITE;
                sb.append(String.format(
                    "<rect x=\"%.1f\" y=\"%.1f\" width=\"%.1f\" height=\"%.1f\" fill=\"%s\" stroke=\"#333\" stroke-width=\"1\"/>\n",
                    px, py, pWidth, pHeight, corFrente
                ));
                
                // Número
                sb.append(String.format(
                    "<text x=\"%.1f\" y=\"%.1f\" font-family=\"Arial\" font-size=\"9\" fill=\"#333\" text-anchor=\"middle\" font-weight=\"bold\">%d</text>\n",
                    px + pWidth/2, py + pHeight/2 + 3, placaNum + 1
                ));
                
                if (isCorte) {
                    sb.append(String.format(
                        "<line x1=\"%.1f\" y1=\"%.1f\" x2=\"%.1f\" y2=\"%.1f\" stroke=\"%s\" stroke-width=\"2\" stroke-dasharray=\"5,3\"/>\n",
                        px + pWidth * 0.7, py - offset3d * 2, px + pWidth * 0.7, py + pHeight, COR_CORTE
                    ));
                }
                
                placaNum++;
            }
        }
        
        return sb.toString();
    }
}


