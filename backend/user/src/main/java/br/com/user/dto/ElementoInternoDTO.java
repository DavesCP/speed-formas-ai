package br.com.user.dto;

import br.com.user.enums.TipoElemento;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO do Elemento Interno")
public class ElementoInternoDTO {

    @Schema(description = "Tipo do elemento", example = "Parede")
    private TipoElemento tipo;

    @Schema(description = "Identificação do elemento", example = "p3.1")
    private String identificacao;

    private BigDecimal largura;
    private BigDecimal  altura;
    private Integer comprimento;
    private Integer quantidadeLP;
}
