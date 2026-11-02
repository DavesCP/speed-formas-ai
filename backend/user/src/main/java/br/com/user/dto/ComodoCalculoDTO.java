package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Resultado do cálculo por cômodo")
public class ComodoCalculoDTO {

    @Schema(description = "Nome do cômodo", example = "COZINHA")
    private String nomeComodo;

    @Schema(description = "Resultado do cálculo das paredes")
    private List<CalculoPlacasDTO> paredes;
}
