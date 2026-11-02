package br.com.user.service;

import br.com.user.dto.FormaSpeedDTO;

import java.util.List;
import java.util.Optional;

public interface FormaSpeedService {

    FormaSpeedDTO salvar(FormaSpeedDTO dto);

    Optional<FormaSpeedDTO> buscarPorId(Long id);

    List<FormaSpeedDTO> buscarTodas();

    FormaSpeedDTO atualizar(Long id, FormaSpeedDTO dto);

    void deletar(Long id);
}
