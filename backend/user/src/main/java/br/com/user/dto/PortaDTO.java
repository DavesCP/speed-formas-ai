package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO da Porta")
public class PortaDTO {

    @Schema(description = "Altura da porta")
    private BigDecimal altura;

    @Schema(description = "Comprimento da porta")
    private BigDecimal comprimento;

    @Schema(description = "Posição X da porta (início no comprimento da parede)")
    private BigDecimal posicaoX;

    @Schema(description = "Posição Y da porta (referência superior da parede)")
    private BigDecimal posicaoY;
}
