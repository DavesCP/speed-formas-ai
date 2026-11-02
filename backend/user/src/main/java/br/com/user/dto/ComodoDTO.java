package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO do Cômodo")
public class ComodoDTO {

    @Schema(description = "Nome do cômodo", example = "COZINHA")
    private String nomeComodo;

    @Schema(description = "Lista de paredes")
    private List<ParedeDTO> paredes;


}
