package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "DTO de Projeto")
public class ProjetoDTO {

    @Schema(description = "ID do projeto")
    private Long id;

    @Schema(description = "Nome do projeto", example = "Edifício Residencial Aurora")
    private String name;

    @Schema(description = "Nome do cliente", example = "Construtora ABC")
    private String client;

    @Schema(description = "Status do projeto", example = "in-progress")
    private String status;

    @Schema(description = "Progresso do projeto em porcentagem", example = "65")
    private Integer progress;

    @Schema(description = "Data de início", example = "2024-01-15")
    private LocalDate startDate;

    @Schema(description = "Data de término", example = "2024-12-30")
    private LocalDate endDate;

    @Schema(description = "Orçamento do projeto", example = "2500000.00")
    private BigDecimal budget;

    @Schema(description = "Equipe do projeto")
    private List<String> team;

    @Schema(description = "Descrição do projeto")
    private String description;
}
