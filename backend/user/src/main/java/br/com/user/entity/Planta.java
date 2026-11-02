package br.com.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "plantas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entidade que representa uma planta arquitetônica")
public class Planta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID da planta")
    private Long id;

    @Version
    @JsonIgnore
    @Schema(hidden = true)
    private Long version;

    @Column(nullable = false)
    @Schema(description = "Nome da planta", example = "Planta Residencial")
    private String nome;

    @Column(nullable = false)
    @Schema(description = "Unidade de medida utilizada", example = "cm")
    private String unidadeMedida;

    @OneToMany(mappedBy = "planta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "Lista de cômodos da planta")
    private List<Comodo> comodos;
}
