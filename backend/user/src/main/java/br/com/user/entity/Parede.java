package br.com.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "paredes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entidade que representa uma parede")
public class Parede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID da parede")
    private Long id;

    @Version
    @JsonIgnore
    @Schema(hidden = true)
    private Long version;

    @Column(nullable = false)
    @Schema(description = "Identificação da parede", example = "p1")
    private String identificacaoParede;

    @Column(nullable = false)
    private Integer altura;

    @Column(nullable = false)
    private Integer largura;

    @Column(nullable = false)
    private Integer comprimento;

    @Column(nullable = false)
    @Schema(description = "Quantidade de LP")
    private Integer quantidadeLP;

    @ManyToOne
    @JoinColumn(name = "comodo_id", nullable = false)
    @JsonIgnore
    private Comodo comodo;

    @OneToMany(mappedBy = "parede", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "Elementos internos da parede")
    private List<ElementoInterno> elementosInternos;
}
