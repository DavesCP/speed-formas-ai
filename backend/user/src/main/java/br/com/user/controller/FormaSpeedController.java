package br.com.user.controller;

import br.com.user.dto.FormaSpeedDTO;
import br.com.user.service.FormaSpeedService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forma-speed")
@RequiredArgsConstructor
@Tag(name = "FormaSpeed", description = "Gerenciamento de Formas Speed")
public class FormaSpeedController {

    private final FormaSpeedService formaSpeedService;

    @PostMapping
    @Operation(
            summary = "Criar nova Forma Speed",
            description = "Cria uma nova Forma Speed com largura e altura"
    )
    @ApiResponse(responseCode = "201", description = "Forma Speed criada com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    public ResponseEntity<FormaSpeedDTO> create(
            @RequestBody FormaSpeedDTO dto) {

        FormaSpeedDTO created = formaSpeedService.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obter Forma Speed por ID",
            description = "Retorna uma Forma Speed específica pelo seu ID"
    )
    @ApiResponse(responseCode = "200", description = "Forma Speed encontrada")
    @ApiResponse(responseCode = "404", description = "Forma Speed não encontrada")
    public ResponseEntity<FormaSpeedDTO> getById(
            @Parameter(description = "ID da Forma Speed", required = true)
            @PathVariable Long id) {

        return formaSpeedService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(
            summary = "Listar todas as Formas Speed",
            description = "Retorna uma lista de todas as Formas Speed cadastradas"
    )
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    public ResponseEntity<List<FormaSpeedDTO>> getAll() {
        return ResponseEntity.ok(formaSpeedService.buscarTodas());
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Atualizar Forma Speed",
            description = "Atualiza os dados de uma Forma Speed existente"
    )
    @ApiResponse(responseCode = "200", description = "Forma Speed atualizada com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    @ApiResponse(responseCode = "404", description = "Forma Speed não encontrada")
    public ResponseEntity<FormaSpeedDTO> update(
            @Parameter(description = "ID da Forma Speed", required = true)
            @PathVariable Long id,
            @RequestBody FormaSpeedDTO dto) {

        try {
            FormaSpeedDTO updated = formaSpeedService.atualizar(id, dto);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Deletar Forma Speed",
            description = "Remove uma Forma Speed da base de dados"
    )
    @ApiResponse(responseCode = "204", description = "Forma Speed deletada com sucesso")
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID da Forma Speed", required = true)
            @PathVariable Long id) {

        formaSpeedService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
