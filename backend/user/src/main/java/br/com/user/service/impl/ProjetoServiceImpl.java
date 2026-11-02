package br.com.user.service.impl;

import br.com.user.dto.CreateProjetoRequest;
import br.com.user.dto.ProjetoDTO;
import br.com.user.entity.Projeto;
import br.com.user.repository.ProjetoRepository;
import br.com.user.service.ProjetoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProjetoServiceImpl implements ProjetoService {

    private final ProjetoRepository projetoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjetoDTO> findAll() {
        log.info("Buscando todos os projetos");
        return projetoRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjetoDTO findById(Long id) {
        log.info("Buscando projeto por ID: {}", id);
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado: " + id));
        return toDTO(projeto);
    }

    @Override
    public ProjetoDTO create(CreateProjetoRequest request) {
        log.info("Criando novo projeto: {}", request.getName());
        
        Projeto projeto = Projeto.builder()
                .nome(request.getName())
                .cliente(request.getClient())
                .status(request.getStatus() != null ? request.getStatus() : "planning")
                .progresso(0)
                .dataInicio(request.getStartDate())
                .dataFim(request.getEndDate())
                .orcamento(request.getBudget())
                .descricao(request.getDescription())
                .equipe(new ArrayList<>())
                .build();
        
        projeto = projetoRepository.save(projeto);
        log.info("Projeto criado com ID: {}", projeto.getId());
        
        return toDTO(projeto);
    }

    @Override
    public ProjetoDTO update(Long id, CreateProjetoRequest request) {
        log.info("Atualizando projeto ID: {}", id);
        
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Projeto não encontrado: " + id));
        
        if (request.getName() != null) {
            projeto.setNome(request.getName());
        }
        if (request.getClient() != null) {
            projeto.setCliente(request.getClient());
        }
        if (request.getStatus() != null) {
            projeto.setStatus(request.getStatus());
        }
        if (request.getStartDate() != null) {
            projeto.setDataInicio(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            projeto.setDataFim(request.getEndDate());
        }
        if (request.getBudget() != null) {
            projeto.setOrcamento(request.getBudget());
        }
        if (request.getDescription() != null) {
            projeto.setDescricao(request.getDescription());
        }
        
        projeto = projetoRepository.save(projeto);
        log.info("Projeto atualizado: {}", projeto.getId());
        
        return toDTO(projeto);
    }

    @Override
    public void delete(Long id) {
        log.info("Deletando projeto ID: {}", id);
        
        if (!projetoRepository.existsById(id)) {
            throw new RuntimeException("Projeto não encontrado: " + id);
        }
        
        projetoRepository.deleteById(id);
        log.info("Projeto deletado: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjetoDTO> findByStatus(String status) {
        log.info("Buscando projetos por status: {}", status);
        return projetoRepository.findByStatus(status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private ProjetoDTO toDTO(Projeto projeto) {
        return ProjetoDTO.builder()
                .id(projeto.getId())
                .name(projeto.getNome())
                .client(projeto.getCliente())
                .status(projeto.getStatus())
                .progress(projeto.getProgresso())
                .startDate(projeto.getDataInicio())
                .endDate(projeto.getDataFim())
                .budget(projeto.getOrcamento())
                .team(projeto.getEquipe())
                .description(projeto.getDescricao())
                .build();
    }
}


