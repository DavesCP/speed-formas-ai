package br.com.user.dto;

import br.com.user.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Resposta de login")
public class LoginResponse {

    @Schema(description = "ID do usuário")
    private Long id;

    @Schema(description = "Nome completo do usuário")
    private String name;

    @Schema(description = "Email do usuário")
    private String email;

    @Schema(description = "Nome de usuário")
    private String username;

    @Schema(description = "Perfil/Role do usuário")
    private Role role;

    @Schema(description = "Mensagem de sucesso ou erro")
    private String message;
}


