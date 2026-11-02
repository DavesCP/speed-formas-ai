package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO para criar um novo projeto")
public class CriarProjetoDTO {

    @NotBlank(message = "O nome do projeto é obrigatório")
    @Schema(description = "Nome do projeto", example = "Residência Silva")
    private String nome;

    @Schema(description = "Descrição do projeto")
    private String descricao;
}


