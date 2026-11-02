package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO para analisar planta com IA")
public class AnalisarPlantaDTO {

    @NotBlank(message = "O nome da geração é obrigatório")
    @Schema(description = "Nome da geração", example = "Análise Principal")
    private String nome;

    @NotBlank(message = "A planta estrutural é obrigatória")
    @Schema(description = "Planta estrutural em Base64")
    private String plantaEstruturalBase64;

    @Schema(description = "Planta elétrica em Base64 (opcional)")
    private String plantaEletricaBase64;
}


