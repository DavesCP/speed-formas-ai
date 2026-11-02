package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO da Forma Speed")
public class FormaSpeedDTO {

    @Schema(description = "Largura da forma", example = "1.10")
    private BigDecimal largura;

    @Schema(description = "Altura da forma", example = "2.30")
    private BigDecimal altura;
}
