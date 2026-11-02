package br.com.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projetos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Projeto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String cliente;

    @Column(nullable = false)
    private String status; // planning, in-progress, completed, on-hold

    @Column(nullable = false)
    private Integer progresso;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim")
    private LocalDate dataFim;

    @Column(precision = 15, scale = 2)
    private BigDecimal orcamento;

    @ElementCollection
    @CollectionTable(name = "projeto_equipe", joinColumns = @JoinColumn(name = "projeto_id"))
    @Column(name = "membro")
    @Builder.Default
    private List<String> equipe = new ArrayList<>();

    @Column(length = 1000)
    private String descricao;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserRole user;

    @OneToMany(mappedBy = "projeto", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GeracaoIA> geracoes = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (progresso == null) {
            progresso = 0;
        }
        if (status == null) {
            status = "planning";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
