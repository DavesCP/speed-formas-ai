package br.com.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecorteDTO {

    // Dimensão do recorte
    private BigDecimal largura;
    private BigDecimal altura;

    // Posição DO RECORTE DENTRO DA PLACA
    // referência sempre no canto inferior esquerdo da placa
    private BigDecimal posicaoX;
    private BigDecimal posicaoY;
}

