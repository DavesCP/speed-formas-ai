package br.com.user.service.impl;

import br.com.user.dto.*;
import br.com.user.service.CalculoFormaService;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class CalculoFormaServiceImpl implements CalculoFormaService {

    private static final Logger log =
            LogManager.getLogger(CalculoFormaServiceImpl.class);

    // PLACA PADRÃO DO DOMÍNIO
    private static final BigDecimal COMPRIMENTO_PLACA = new BigDecimal("1.1");
    private static final BigDecimal ALTURA_PLACA  = new BigDecimal("2.2");

    /**
     * Calcula o resultado de placas para uma lista de paredes
     */
    @Override
    public List<CalculoPlacasDTO> calcularPlacasPorParedes(List<ParedeDTO> paredes) {

        List<CalculoPlacasDTO> resultado = new ArrayList<>();

        for (ParedeDTO parede : paredes) {

            BigDecimal comprimentoParede = parede.getComprimento();
            BigDecimal alturaParede = parede.getAltura();

            boolean temPorta =
                    parede.getPortas() != null && !parede.getPortas().isEmpty();

            boolean temJanela =
                    parede.getJanelas() != null && !parede.getJanelas().isEmpty();

            /*
             * =========================================================
             * CASO 1 — SEM PORTAS E SEM JANELAS
             * (LÓGICA ANTIGA — INTACTA)
             * =========================================================
             */
            if (!temPorta && !temJanela) {

                int colunasInteiras = comprimentoParede
                        .divide(COMPRIMENTO_PLACA, 10, RoundingMode.DOWN)
                        .intValue();

                int fileirasInteiras = alturaParede
                        .divide(ALTURA_PLACA, 10, RoundingMode.DOWN)
                        .intValue();

                BigDecimal sobraComprimento =
                        comprimentoParede.subtract(
                                COMPRIMENTO_PLACA.multiply(BigDecimal.valueOf(colunasInteiras)));

                BigDecimal sobraAltura =
                        alturaParede.subtract(
                                ALTURA_PLACA.multiply(BigDecimal.valueOf(fileirasInteiras)));

                boolean temCorteComprimento = sobraComprimento.compareTo(BigDecimal.ZERO) > 0;
                boolean temCorteAltura = sobraAltura.compareTo(BigDecimal.ZERO) > 0;

                int placasInteiras = colunasInteiras * fileirasInteiras;

                int qtdPlacasCorteComprimento =
                        temCorteComprimento ? fileirasInteiras : 0;

                int qtdPlacasCorteAltura =
                        temCorteAltura ? colunasInteiras : 0;

                int qtdPlacaCorteAlturaEComprimento =
                        (temCorteAltura && temCorteComprimento) ? 1 : 0;

                int totalPlacas =
                        placasInteiras
                                + qtdPlacasCorteComprimento
                                + qtdPlacasCorteAltura
                                + qtdPlacaCorteAlturaEComprimento;

                resultado.add(
                        CalculoPlacasDTO.builder()
                                .identificador(parede.getIdentificacaoParede())
                                .placasInteiras(placasInteiras)

                                .qtdPlacasCorteComprimento(qtdPlacasCorteComprimento)
                                .placaCorteComprimento(
                                        temCorteComprimento
                                                ? PlacaCorteDTO.builder()
                                                .altura(BigDecimal.ZERO)
                                                .comprimento(sobraComprimento.setScale(2))
                                                .build()
                                                : null
                                )

                                .qtdPlacasCorteAltura(qtdPlacasCorteAltura)
                                .placaCorteAltura(
                                        temCorteAltura
                                                ? PlacaCorteDTO.builder()
                                                .altura(sobraAltura.setScale(2))
                                                .comprimento(BigDecimal.ZERO)
                                                .build()
                                                : null
                                )

                                .qtdPlacaCorteAlturaEComprimento(qtdPlacaCorteAlturaEComprimento)
                                .placaCorteAlturaEComprimento(
                                        qtdPlacaCorteAlturaEComprimento > 0
                                                ? List.of(
                                                CortePlacaDTO.builder()
                                                        .altura(sobraAltura.setScale(2))
                                                        .comprimento(sobraComprimento.setScale(2))
                                                        .build()
                                        )
                                                : List.of()
                                )

                                .totalPlacas(totalPlacas)
                                .build()
                );

                continue;
            }

            /*
             * =========================================================
             * CASO 2 — COM PORTA E/OU JANELA
             * =========================================================
             */

            int colunas = comprimentoParede
                    .divide(COMPRIMENTO_PLACA, 10, RoundingMode.DOWN)
                    .intValue();

            int fileiras = alturaParede
                    .divide(ALTURA_PLACA, 10, RoundingMode.DOWN)
                    .intValue();

            int totalPlacas = colunas * fileiras;

            boolean[] placaCortada = new boolean[colunas];

            // agregado (porta)
            List<CortePlacaDTO> cortesAlturaEComprimento = new ArrayList<>();

            // posicional (janela)
            List<PlacaComRecortesDTO> placasComRecortes = new ArrayList<>();

            /* -------------------------
             * PORTAS → MODELO AGREGADO
             * ------------------------- */
            if (temPorta) {

                for (PortaDTO porta : parede.getPortas()) {

                    BigDecimal portaInicioX = porta.getPosicaoX();
                    BigDecimal portaFimX = portaInicioX.add(porta.getComprimento());

                    BigDecimal portaTopoY = alturaParede.subtract(porta.getPosicaoY());
                    BigDecimal portaBaseY = portaTopoY.subtract(porta.getAltura());

                    for (int coluna = 0; coluna < colunas; coluna++) {

                        BigDecimal placaInicioX =
                                COMPRIMENTO_PLACA.multiply(BigDecimal.valueOf(coluna));
                        BigDecimal placaFimX =
                                placaInicioX.add(COMPRIMENTO_PLACA);

                        BigDecimal ix = placaInicioX.max(portaInicioX);
                        BigDecimal fx = placaFimX.min(portaFimX);

                        BigDecimal corteX = fx.subtract(ix);

                        boolean intersectaY =
                                portaTopoY.compareTo(BigDecimal.ZERO) > 0 &&
                                        portaBaseY.compareTo(alturaParede) < 0;

                        if (corteX.compareTo(BigDecimal.ZERO) > 0 && intersectaY) {

                            placaCortada[coluna] = true;

                            cortesAlturaEComprimento.add(
                                    CortePlacaDTO.builder()
                                            .altura(porta.getAltura())
                                            .comprimento(corteX.setScale(2))
                                            .build()
                            );
                        }
                    }
                }
            }

            /* -------------------------
             * JANELAS → MODELO POSICIONAL
             * ------------------------- */
            if (temJanela) {

                for (JanelaDTO janela : parede.getJanelas()) {

                    BigDecimal janelaInicioX = janela.getPosicaoX();
                    BigDecimal janelaFimX = janelaInicioX.add(janela.getComprimento());

                    BigDecimal janelaBaseY = janela.getPosicaoSolo();
                    BigDecimal janelaTopoY = janelaBaseY.add(janela.getAltura());

                    for (int coluna = 0; coluna < colunas; coluna++) {

                        BigDecimal placaInicioX =
                                COMPRIMENTO_PLACA.multiply(BigDecimal.valueOf(coluna));
                        BigDecimal placaFimX =
                                placaInicioX.add(COMPRIMENTO_PLACA);

                        BigDecimal ix = placaInicioX.max(janelaInicioX);
                        BigDecimal fx = placaFimX.min(janelaFimX);

                        BigDecimal corteX = fx.subtract(ix);

                        boolean intersectaY =
                                janelaTopoY.compareTo(BigDecimal.ZERO) > 0 &&
                                        janelaBaseY.compareTo(alturaParede) < 0;

                        if (corteX.compareTo(BigDecimal.ZERO) > 0 && intersectaY) {

                            placaCortada[coluna] = true;

                            placasComRecortes.add(
                                    PlacaComRecortesDTO.builder()
                                            .numeroPlaca(coluna + 1)
                                            .larguraPlaca(COMPRIMENTO_PLACA)
                                            .alturaPlaca(ALTURA_PLACA)
                                            .recortes(List.of(
                                                    RecorteDTO.builder()
                                                            .largura(corteX.setScale(2))
                                                            .altura(janela.getAltura())
                                                            .posicaoX(
                                                                    ix.subtract(placaInicioX).setScale(2)
                                                            )
                                                            .posicaoY(
                                                                    janelaBaseY.setScale(2)
                                                            )
                                                            .build()
                                            ))
                                            .build()
                            );
                        }
                    }
                }
            }

            int placasComCorte = 0;
            for (boolean b : placaCortada) {
                if (b) placasComCorte++;
            }

            int placasInteiras = totalPlacas - placasComCorte;

            CalculoPlacasDTO dto = CalculoPlacasDTO.builder()
                    .identificador(parede.getIdentificacaoParede())
                    .placasInteiras(placasInteiras)
                    .totalPlacas(totalPlacas)
                    .build();

            // ---------- REGRA FINAL DE PREENCHIMENTO ----------
            if (!placasComRecortes.isEmpty()) {

                dto.setQtdPlacaCorteAlturaEComprimento(0);
                dto.setPlacaCorteAlturaEComprimento(List.of());

                dto.setPlacaCorteAlturaEComprimentoPosicaoY(
                        PlacaCorteAlturaEComprimentoPosicaoY.builder()
                                .qtdPlacas(placasComRecortes.size())
                                .placas(placasComRecortes)
                                .build()
                );

            } else {
                dto.setQtdPlacaCorteAlturaEComprimento(cortesAlturaEComprimento.size());
                dto.setPlacaCorteAlturaEComprimento(cortesAlturaEComprimento);
            }
            resultado.add(dto);
        }
        return resultado;
    }




    /**
     * MONTA A ESTRUTURA FINAL DA RESPOSTA (PLANTA → CÔMODOS → PAREDES)
     */
    @Override
    public PlantaCalculoDTO calcularPlanta(PlantaDTO plantaDTO) {

        List<ComodoCalculoDTO> comodosCalculados = new ArrayList<>();

        for (ComodoDTO comodo : plantaDTO.getComodos()) {

            List<CalculoPlacasDTO> calculos =
                    calcularPlacasPorParedes(comodo.getParedes());

            ComodoCalculoDTO comodoCalculo = ComodoCalculoDTO.builder()
                    .nomeComodo(comodo.getNomeComodo())
                    .paredes(calculos)
                    .build();

            comodosCalculados.add(comodoCalculo);
        }

        return PlantaCalculoDTO.builder()
                .nome(plantaDTO.getNome())
                .unidadeMedida(plantaDTO.getUnidadeMedida())
                .comodosCalculados(comodosCalculados)
                .build();
    }
}
