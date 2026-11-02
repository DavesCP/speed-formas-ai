package br.com.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Requisição de login")
public class LoginRequest {

    @Schema(description = "Nome de usuário ou email", example = "admin")
    private String username;

    @Schema(description = "Senha do usuário", example = "admin123")
    private String password;
}


