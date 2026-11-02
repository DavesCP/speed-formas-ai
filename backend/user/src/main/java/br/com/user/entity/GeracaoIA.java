package br.com.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "geracoes_ia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeracaoIA {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false)
    private String nome;

    @Column(name = "planta_estrutural_base64", columnDefinition = "TEXT")
    private String plantaEstruturalBase64;

    @Column(name = "planta_eletrica_base64", columnDefinition = "TEXT")
    private String plantaEletricaBase64;

    @Column(name = "dados_extraidos", columnDefinition = "TEXT")
    private String dadosExtraidos; // JSON com os dados extraídos pela IA

    @Column(name = "dados_validados", columnDefinition = "TEXT")
    private String dadosValidados; // JSON com os dados validados pelo usuário

    @Column(name = "imagens_cortes", columnDefinition = "TEXT")
    private String imagensCortes; // JSON com URLs/base64 das imagens de cortes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusGeracao status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;

    public enum StatusGeracao {
        AGUARDANDO_ANALISE,
        ANALISADO,
        VALIDADO,
        CORTES_GERADOS,
        ERRO
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = StatusGeracao.AGUARDANDO_ANALISE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}


