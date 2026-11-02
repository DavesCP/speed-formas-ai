package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO da Janela")
public class JanelaDTO {

    @Schema(description = "Altura da janela")
    private BigDecimal altura;

    @Schema(description = "Comprimento da janela")
    private BigDecimal comprimento;

    @Schema(description = "Posição da janela em relação ao solo")
    private BigDecimal posicaoSolo;

    @Schema(description = "Posição X da janela")
    private BigDecimal posicaoX;

    @Schema(description = "Posição Y da janela")
    private BigDecimal posicaoY;
}
