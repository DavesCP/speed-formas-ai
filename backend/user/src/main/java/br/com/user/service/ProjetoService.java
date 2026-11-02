package br.com.user.service;

import br.com.user.dto.CreateProjetoRequest;
import br.com.user.dto.ProjetoDTO;

import java.util.List;

public interface ProjetoService {
    
    List<ProjetoDTO> findAll();
    
    ProjetoDTO findById(Long id);
    
    ProjetoDTO create(CreateProjetoRequest request);
    
    ProjetoDTO update(Long id, CreateProjetoRequest request);
    
    void delete(Long id);
    
    List<ProjetoDTO> findByStatus(String status);
}


