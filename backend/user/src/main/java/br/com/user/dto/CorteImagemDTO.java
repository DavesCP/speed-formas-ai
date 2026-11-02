package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "DTO com dados do corte de uma parede")
public class CorteImagemDTO {
    
    @Schema(description = "Identificação da parede", example = "P1")
    private String identificacao;
    
    @Schema(description = "Nome do cômodo", example = "SALA")
    private String nomeComodo;
    
    @Schema(description = "Comprimento da parede em cm", example = "400")
    private Double comprimento;
    
    @Schema(description = "Altura da parede em cm", example = "280")
    private Double altura;
    
    @Schema(description = "Quantidade de placas inteiras", example = "3")
    private Integer placasInteiras;
    
    @Schema(description = "Quantidade de placas com corte", example = "2")
    private Integer placasComCorte;
    
    @Schema(description = "Total de placas", example = "5")
    private Integer totalPlacas;
    
    @Schema(description = "Sobra na largura em cm", example = "30")
    private Double sobraLargura;
    
    @Schema(description = "Sobra na altura em cm", example = "40")
    private Double sobraAltura;
    
    @Schema(description = "Código SVG do desenho técnico do corte")
    private String svgCorte;
    
    @Schema(description = "Descrição textual dos cortes (opcional)")
    private String descricaoCortes;
    
    @Schema(description = "Imagem em Base64 (opcional)")
    private String imagemBase64;
}
