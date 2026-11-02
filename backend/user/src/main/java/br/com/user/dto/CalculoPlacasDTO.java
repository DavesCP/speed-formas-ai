package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Resultado do cálculo de placas por parede")
public class CalculoPlacasDTO {

    @Schema(description = "Identificador da parede", example = "p1")
    private String identificador;

    @Schema(description = "Quantidade de placas inteiras (sem cortes)")
    private int placasInteiras;

    @Schema(description = "Quantidade de placas com corte somente na largura")
    private int qtdPlacasCorteComprimento;

    @Schema(description = "Dimensão do corte somente na largura")
    private PlacaCorteDTO placaCorteComprimento;

    @Schema(description = "Quantidade de placas com corte somente na altura")
    private int qtdPlacasCorteAltura;

    @Schema(description = "Dimensão do corte somente na altura")
    private PlacaCorteDTO placaCorteAltura;

    @Schema(description = "Quantidade de placas com corte na altura e na largura")
    private int qtdPlacaCorteAlturaEComprimento;

    @Schema(description = "Dimensão do corte na altura e na largura")
    private List<CortePlacaDTO> placaCorteAlturaEComprimento;

    @Schema(description = "Detalhamento de cortes internos por placa (janelas)")
    private List<PlacaComRecortesDTO> placasComRecortes;

    @Schema(description = "Cortes internos com posição Y (ex: janelas no meio da placa)")
    private PlacaCorteAlturaEComprimentoPosicaoY placaCorteAlturaEComprimentoPosicaoY;

    @Schema(description = "Total de placas utilizadas")
    private int totalPlacas;
}
