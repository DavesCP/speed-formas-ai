package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request para criar projeto")
public class CreateProjetoRequest {

    @Schema(description = "Nome do projeto", required = true, example = "Edifício Residencial Aurora")
    private String name;

    @Schema(description = "Nome do cliente", required = true, example = "Construtora ABC")
    private String client;

    @Schema(description = "Status do projeto", example = "planning")
    private String status;

    @Schema(description = "Data de início", required = true, example = "2024-01-15")
    private LocalDate startDate;

    @Schema(description = "Data de término", example = "2024-12-30")
    private LocalDate endDate;

    @Schema(description = "Orçamento do projeto", example = "2500000.00")
    private BigDecimal budget;

    @Schema(description = "Descrição do projeto")
    private String description;
}


