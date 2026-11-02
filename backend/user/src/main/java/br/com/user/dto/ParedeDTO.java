package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO da Parede")
public class ParedeDTO {

    @Schema(description = "Identificação da parede", example = "p1")
    private String identificacaoParede;

    @Schema(description = "Altura da parede")
    private BigDecimal altura;

    @Schema(description = "Largura (não utilizada neste cálculo)")
    private BigDecimal largura;

    @Schema(description = "Comprimento da parede")
    private BigDecimal comprimento;

    @Schema(description = "Quantidade de LP")
    private Integer quantidadeLP;

    @Schema(description = "Lista de portas")
    private List<PortaDTO> portas;

    @Schema(description = "Lista de janelas")
    private List<JanelaDTO> janelas;
}
