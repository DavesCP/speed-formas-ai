package br.com.user.controller;

import br.com.user.dto.LoginRequest;
import br.com.user.dto.LoginResponse;
import br.com.user.entity.UserRole;
import br.com.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints de autenticação")
public class AuthController {

    private final UserRepository userRepository;

    @PostMapping("/login")
    @Operation(summary = "Realizar login", description = "Autentica um usuário com username/email e senha")
    @ApiResponse(responseCode = "200", description = "Login realizado com sucesso")
    @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        // Busca por username ou email
        Optional<UserRole> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(request.getUsername());
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(
                LoginResponse.builder()
                    .message("Usuário não encontrado")
                    .build()
            );
        }

        UserRole user = userOpt.get();

        // Verifica a senha (simples comparação - em produção use BCrypt)
        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.status(401).body(
                LoginResponse.builder()
                    .message("Senha incorreta")
                    .build()
            );
        }

        return ResponseEntity.ok(
            LoginResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .message("Login realizado com sucesso")
                .build()
        );
    }

    @GetMapping("/me/{id}")
    @Operation(summary = "Obter usuário logado", description = "Retorna os dados do usuário pelo ID")
    @ApiResponse(responseCode = "200", description = "Usuário encontrado")
    @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    public ResponseEntity<LoginResponse> getCurrentUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> ResponseEntity.ok(
                LoginResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .role(user.getRole())
                    .message("Usuário encontrado")
                    .build()
            ))
            .orElse(ResponseEntity.notFound().build());
    }
}


