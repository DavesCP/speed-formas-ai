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
@Schema(description = "Requisição de atualização de usuário")
public class UserUpdateRequest {

    @Schema(description = "Nome completo do usuário", example = "João Silva")
    private String name;

    @Schema(description = "CPF do usuário (11 dígitos)", example = "12345678900")
    private String cpf;

    @Schema(description = "Endereço do usuário", example = "Rua Principal, 123, São Paulo, SP")
    private String address;

    @Schema(description = "Email do usuário", example = "joao.silva@email.com")
    private String email;

    @Schema(description = "Nome de usuário para login", example = "joao.silva")
    private String username;

    @Schema(description = "Senha do usuário (deixe vazio para manter a atual)", example = "novaSenha123")
    private String password;

    @Schema(description = "Perfil/Role do usuário", example = "USER", allowableValues = {"ADMIN", "USER"})
    private Role role;
}
