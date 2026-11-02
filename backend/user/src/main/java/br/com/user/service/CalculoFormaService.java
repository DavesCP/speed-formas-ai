package br.com.user.service;

import br.com.user.dto.CalculoPlacasDTO;
import br.com.user.dto.ParedeDTO;
import br.com.user.dto.PlantaCalculoDTO;
import br.com.user.dto.PlantaDTO;

import java.util.List;

public interface CalculoFormaService {

    List<CalculoPlacasDTO> calcularPlacasPorParedes(List<ParedeDTO> paredes);
    PlantaCalculoDTO calcularPlanta(PlantaDTO plantaDTO);
}
