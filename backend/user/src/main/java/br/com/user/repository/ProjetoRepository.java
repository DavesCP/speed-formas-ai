package br.com.user.repository;

import br.com.user.entity.Projeto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetoRepository extends JpaRepository<Projeto, Long> {
    
    List<Projeto> findByStatus(String status);
    
    List<Projeto> findByClienteContainingIgnoreCase(String cliente);
    
    List<Projeto> findByNomeContainingIgnoreCase(String nome);
    
    List<Projeto> findAllByOrderByCreatedAtDesc();
}
