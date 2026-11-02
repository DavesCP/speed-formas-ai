package br.com.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacaComRecortesDTO {

    private Integer numeroPlaca;

    private BigDecimal larguraPlaca;
    private BigDecimal alturaPlaca;

    private List<RecorteDTO> recortes;
}

