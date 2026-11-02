package br.com.user.controller;

import br.com.user.dto.CalculoPlacasDTO;
import br.com.user.dto.ParedeDTO;
import br.com.user.dto.PlantaCalculoDTO;
import br.com.user.dto.PlantaDTO;
import br.com.user.service.CalculoFormaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plantas")
@RequiredArgsConstructor
@Tag(name = "Plantas", description = "Gerenciamento de Plantas Arquitetônicas")
public class PlantaController {

    private final CalculoFormaService calculoFormaService;

    private static final Logger log = LogManager.getLogger(PlantaController.class);

    @PostMapping("/calcular-placas")
    @Operation(
            summary = "Calcular placas da planta",
            description = "Recebe uma planta com seus cômodos e paredes e retorna a própria planta "
                    + "com os cálculos de placas (inteiras e com cortes) realizados para cada parede."
    )
    @ApiResponse(responseCode = "200", description = "Cálculo de placas realizado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos na planta ou nas dimensões das paredes")
    public ResponseEntity<PlantaCalculoDTO> calcularPlacas(
            @RequestBody PlantaDTO plantaDTO) {

        log.info("Iniciando cálculo de placas para planta: {}", plantaDTO.getNome());

        PlantaCalculoDTO resultado =
                calculoFormaService.calcularPlanta(plantaDTO);

        return ResponseEntity.ok(resultado);
    }


}
