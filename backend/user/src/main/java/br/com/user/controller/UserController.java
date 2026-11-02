package br.com.user.controller;

import br.com.user.dto.UserUpdateRequest;
import br.com.user.entity.UserRole;
import br.com.user.service.UserService;
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
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gerenciamento de Usuários")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Criar novo usuário", description = "Cria um novo usuário com os dados fornecidos")
    @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou CPF/Email já cadastrados")
    public ResponseEntity<UserRole> createUser(@RequestBody UserRole userRole) {
        UserRole createdUserRole = userService.createUser(userRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUserRole);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter usuário por ID", description = "Retorna um usuário específico pelo seu ID")
    @ApiResponse(responseCode = "200", description = "Usuário encontrado")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    public ResponseEntity<UserRole> getUserById(
            @Parameter(description = "ID do usuário", required = true) @PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Listar todos os usuários", description = "Retorna uma lista de todos os usuários cadastrados")
    @ApiResponse(responseCode = "200", description = "Lista de usuários retornada com sucesso")
    public ResponseEntity<List<UserRole>> getAllUsers() {
        List<UserRole> userRoles = userService.getAllUsers();
        return ResponseEntity.ok(userRoles);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar usuário", description = "Atualiza os dados de um usuário existente")
    @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso")
    @ApiResponse(responseCode = "400", description = "Dados inválidos ou conflito de CPF/Email")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    public ResponseEntity<UserRole> updateUser(
            @Parameter(description = "ID do usuário", required = true) @PathVariable Long id,
            @RequestBody UserUpdateRequest updateRequest) {
        try {
            UserRole updatedUserRole = userService.updateUser(id, updateRequest);
            return ResponseEntity.ok(updatedUserRole);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deletar usuário", description = "Remove um usuário da base de dados")
    @ApiResponse(responseCode = "204", description = "Usuário deletado com sucesso")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID do usuário", required = true) @PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
