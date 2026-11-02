package br.com.user.entity;

import br.com.user.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entidade de Usuário")
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID único do usuário")
    private Long id;

    @Version
    @JsonIgnore
    @Schema(hidden = true)
    private Long version;

    @Column(nullable = false)
    @Schema(description = "Nome completo do usuário", example = "João Silva")
    private String name;

    @Column(nullable = false, unique = true)
    @Schema(description = "CPF do usuário (11 dígitos)", example = "12345678900")
    private String cpf;

    @Column(nullable = false)
    @Schema(description = "Endereço do usuário", example = "Rua Principal, 123, São Paulo, SP")
    private String address;

    @Column(nullable = false, unique = true)
    @Schema(description = "Email do usuário", example = "joao.silva@email.com")
    private String email;

    @Column(nullable = false, unique = true)
    @Schema(description = "Nome de usuário para login", example = "joao.silva")
    private String username;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Schema(description = "Senha do usuário", example = "senha123")
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Schema(description = "Perfil/Role do usuário", example = "USER", allowableValues = {"ADMIN", "USER"})
    private Role role;
}
