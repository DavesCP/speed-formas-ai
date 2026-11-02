package br.com.user.service.impl;

import br.com.user.dto.FormaSpeedDTO;
import br.com.user.entity.FormaSpeed;
import br.com.user.mapper.FormaSpeedMapper;
import br.com.user.repository.FormaSpeedRepository;
import br.com.user.service.FormaSpeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class FormaSpeedServiceImpl implements FormaSpeedService {

    private final FormaSpeedRepository repository;
    private final FormaSpeedMapper mapper;

    @Override
    public FormaSpeedDTO salvar(FormaSpeedDTO dto) {
        FormaSpeed entity = mapper.toEntity(dto);

        entity.setId(null);
        entity.setVersion(null);

        FormaSpeed salva = repository.save(entity);
        return mapper.toDto(salva);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<FormaSpeedDTO> buscarPorId(Long id) {
        return repository.findById(id)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormaSpeedDTO> buscarTodas() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public FormaSpeedDTO atualizar(Long id, FormaSpeedDTO dto) {
        return repository.findById(id)
                .map(existente -> {

                    FormaSpeed atualizada = mapper.toEntity(dto);

                    // mantém identidade e versionamento
                    atualizada.setId(existente.getId());
                    atualizada.setVersion(existente.getVersion());

                    FormaSpeed salva = repository.save(atualizada);
                    return mapper.toDto(salva);
                })
                .orElseThrow(() -> new IllegalArgumentException("FormaSpeed não encontrada"));
    }

    @Override
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("FormaSpeed não encontrada");
        }
        repository.deleteById(id);
    }
}
