package br.com.user.repository;

import br.com.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserRole, Long> {
    Optional<UserRole> findByCpf(String cpf);
    Optional<UserRole> findByEmail(String email);
    Optional<UserRole> findByUsername(String username);
    boolean existsByCpf(String cpf);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
