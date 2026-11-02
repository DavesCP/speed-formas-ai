package br.com.user.entity;

import br.com.user.enums.TipoElemento;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "elementos_internos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Elemento interno de uma parede (ex: parede interna, viga)")
public class ElementoInterno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID do elemento interno")
    private Long id;

    @Version
    @JsonIgnore
    @Schema(hidden = true)
    private Long version;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Schema(description = "Tipo do elemento", example = "Parede")
    private TipoElemento tipo;

    @Column(nullable = false)
    @Schema(description = "Identificação do elemento", example = "p3.1")
    private String identificacao;

    private Integer largura;
    private Integer altura;
    private Integer comprimento;

    @Schema(description = "Quantidade de LP (quando aplicável)")
    private Integer quantidadeLP;

    @ManyToOne
    @JoinColumn(name = "parede_id", nullable = false)
    @JsonIgnore
    private Parede parede;
}
