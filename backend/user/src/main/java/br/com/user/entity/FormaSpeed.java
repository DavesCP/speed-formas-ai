package br.com.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "forma_speed")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entidade que representa uma Forma Speed com dimensões decimais")
public class FormaSpeed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID da Forma Speed")
    private Long id;

    @Version
    @JsonIgnore
    @Schema(hidden = true)
    private Long version;

    @Column(nullable = false, precision = 10, scale = 2)
    @Schema(description = "Largura da forma", example = "1.10")
    private BigDecimal largura;

    @Column(nullable = false, precision = 10, scale = 2)
    @Schema(description = "Altura da forma", example = "2.30")
    private BigDecimal altura;
}
