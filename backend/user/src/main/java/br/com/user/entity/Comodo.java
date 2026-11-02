package br.com.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "comodos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entidade que representa um cômodo da planta")
public class Comodo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID do cômodo")
    private Long id;

    @Version
    @JsonIgnore
    @Schema(hidden = true)
    private Long version;

    @Column(nullable = false)
    @Schema(description = "Nome do cômodo", example = "COZINHA")
    private String nomeComodo;

    @ManyToOne
    @JoinColumn(name = "planta_id", nullable = false)
    @JsonIgnore
    private Planta planta;

    @OneToMany(mappedBy = "comodo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(description = "Paredes do cômodo")
    private List<Parede> paredes;
}
