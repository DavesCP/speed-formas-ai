package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dimensão da placa de corte")
public class PlacaCorteDTO {

    @Schema(description = "Altura do corte")
    private BigDecimal altura;

    @Schema(description = "Largura do corte")
    private BigDecimal comprimento;
}
