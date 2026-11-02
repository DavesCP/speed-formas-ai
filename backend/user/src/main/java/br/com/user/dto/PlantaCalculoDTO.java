package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Resultado do cálculo completo da planta")
public class PlantaCalculoDTO {

    @Schema(description = "Nome da planta")
    private String nome;

    @Schema(description = "Unidade de medida")
    private String unidadeMedida;

    @Schema(description = "Cômodos com cálculos")
    List<ComodoCalculoDTO> comodosCalculados;

}
