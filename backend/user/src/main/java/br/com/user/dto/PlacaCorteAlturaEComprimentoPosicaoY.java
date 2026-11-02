package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Cortes de altura e comprimento com posição Y (recortes internos na placa, ex: janelas)")
public class PlacaCorteAlturaEComprimentoPosicaoY {

    @Schema(description = "Quantidade de placas afetadas por cortes internos")
    private Integer qtdPlacas;

    @Schema(description = "Placas com recortes internos detalhados")
    private List<PlacaComRecortesDTO> placas;
}

