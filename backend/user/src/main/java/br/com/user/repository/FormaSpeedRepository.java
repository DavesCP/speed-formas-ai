package br.com.user.repository;

import br.com.user.entity.FormaSpeed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FormaSpeedRepository extends JpaRepository<FormaSpeed, Long> {
}
