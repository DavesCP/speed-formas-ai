package br.com.user.repository;

import br.com.user.entity.GeracaoIA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeracaoIARepository extends JpaRepository<GeracaoIA, Long> {
    List<GeracaoIA> findByProjetoIdOrderByCreatedAtDesc(Long projetoId);
}


