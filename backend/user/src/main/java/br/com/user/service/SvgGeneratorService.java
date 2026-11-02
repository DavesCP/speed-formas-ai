package br.com.user.service;

import br.com.user.dto.CalculoPlacasDTO;

/**
 * Serviço para gerar SVGs de cortes de parede no padrão SpeedFormas
 */
public interface SvgGeneratorService {
    
    /**
     * Gera o SVG do diagrama de corte de uma parede
     * @param identificacaoParede ID da parede (ex: "p1")
     * @param nomeComodo Nome do cômodo (ex: "COZINHA")
     * @param comprimento Comprimento da parede em cm
     * @param altura Altura da parede em cm
     * @param calculo Dados do cálculo de placas
     * @return Código SVG completo
     */
    String gerarSvgCorte(
        String identificacaoParede,
        String nomeComodo,
        double comprimento,
        double altura,
        CalculoPlacasDTO calculo
    );
}


