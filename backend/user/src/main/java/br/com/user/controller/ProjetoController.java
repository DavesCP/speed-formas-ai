package br.com.user.controller;

import br.com.user.dto.CreateProjetoRequest;
import br.com.user.dto.ProjetoDTO;
import br.com.user.service.ProjetoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Projetos", description = "Gerenciamento de Projetos")
public class ProjetoController {

    private final ProjetoService projetoService;

    @GetMapping
    @Operation(summary = "Listar todos os projetos", description = "Retorna todos os projetos cadastrados")
    @ApiResponse(responseCode = "200", description = "Lista de projetos retornada com sucesso")
    public ResponseEntity<List<ProjetoDTO>> findAll() {
        log.info("Requisição para listar todos os projetos");
        return ResponseEntity.ok(projetoService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar projeto por ID", description = "Retorna um projeto específico pelo ID")
    @ApiResponse(responseCode = "200", description = "Projeto encontrado")
    @ApiResponse(responseCode = "404", description = "Projeto não encontrado")
    public ResponseEntity<ProjetoDTO> findById(@PathVariable Long id) {
        log.info("Requisição para buscar projeto ID: {}", id);
        try {
            return ResponseEntity.ok(projetoService.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @Operation(summary = "Criar novo projeto", description = "Cria um novo projeto no sistema")
    @ApiResponse(responseCode = "201", description = "Projeto criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos")
    public ResponseEntity<ProjetoDTO> create(@RequestBody CreateProjetoRequest request) {
        log.info("Requisição para criar projeto: {}", request.getName());
        ProjetoDTO projeto = projetoService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(projeto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar projeto", description = "Atualiza os dados de um projeto existente")
    @ApiResponse(responseCode = "200", description = "Projeto atualizado com sucesso")
    @ApiResponse(responseCode = "404", description = "Projeto não encontrado")
    public ResponseEntity<ProjetoDTO> update(@PathVariable Long id, @RequestBody CreateProjetoRequest request) {
        log.info("Requisição para atualizar projeto ID: {}", id);
        try {
            return ResponseEntity.ok(projetoService.update(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar projeto", description = "Remove um projeto do sistema")
    @ApiResponse(responseCode = "204", description = "Projeto deletado com sucesso")
    @ApiResponse(responseCode = "404", description = "Projeto não encontrado")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Requisição para deletar projeto ID: {}", id);
        try {
            projetoService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Buscar projetos por status", description = "Retorna projetos filtrados por status")
    @ApiResponse(responseCode = "200", description = "Lista de projetos retornada com sucesso")
    public ResponseEntity<List<ProjetoDTO>> findByStatus(@PathVariable String status) {
        log.info("Requisição para buscar projetos por status: {}", status);
        return ResponseEntity.ok(projetoService.findByStatus(status));
    }
}

