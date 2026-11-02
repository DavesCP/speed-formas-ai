package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO da Planta")
public class PlantaDTO {

    @Schema(description = "Nome da planta", example = "Planta Residencial")
    private String nome;

    @Schema(description = "Unidade de medida", example = "cm")
    private String unidadeMedida;

    @Schema(description = "Lista de cômodos")
    private List<ComodoDTO> comodos;
}
