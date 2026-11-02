package br.com.user.dto;

import br.com.user.entity.GeracaoIA;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO da Geração IA")
public class GeracaoIADTO {

    @Schema(description = "ID da geração")
    private Long id;

    @Schema(description = "Nome da geração", example = "Geração 1 - Planta Principal")
    private String nome;

    @Schema(description = "Status da geração")
    private GeracaoIA.StatusGeracao status;

    @Schema(description = "Dados extraídos pela IA (JSON)")
    private String dadosExtraidos;

    @Schema(description = "Dados validados pelo usuário (JSON)")
    private String dadosValidados;

    @Schema(description = "Imagens de cortes geradas (JSON)")
    private String imagensCortes;

    @Schema(description = "Data de criação")
    private LocalDateTime createdAt;

    @Schema(description = "Data de atualização")
    private LocalDateTime updatedAt;

    @Schema(description = "ID do projeto")
    private Long projetoId;
}


