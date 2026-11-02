package br.com.user.service.impl;

import br.com.user.dto.UserUpdateRequest;
import br.com.user.entity.UserRole;
import br.com.user.repository.UserRepository;
import br.com.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserRole createUser(UserRole userRole) {
        userRole.setId(null);
        userRole.setVersion(null);

        if (userRepository.existsByCpf(userRole.getCpf())) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }
        if (userRepository.existsByEmail(userRole.getEmail())) {
            throw new IllegalArgumentException("Email já cadastrado");
        }
        if (userRepository.existsByUsername(userRole.getUsername())) {
            throw new IllegalArgumentException("Nome de usuário já cadastrado");
        }
        return userRepository.save(userRole);
    }

    public Optional<UserRole> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<UserRole> getAllUsers() {
        return userRepository.findAll();
    }

    public UserRole updateUser(Long id, UserUpdateRequest updateRequest) {
        return userRepository.findById(id)
                .map(existingUserRole -> {
                    // Validação de CPF duplicado
                    if (updateRequest.getCpf() != null && 
                        !existingUserRole.getCpf().equals(updateRequest.getCpf()) && 
                        userRepository.existsByCpf(updateRequest.getCpf())) {
                        throw new IllegalArgumentException("CPF já cadastrado");
                    }
                    
                    // Validação de Email duplicado
                    if (updateRequest.getEmail() != null && 
                        !existingUserRole.getEmail().equals(updateRequest.getEmail()) && 
                        userRepository.existsByEmail(updateRequest.getEmail())) {
                        throw new IllegalArgumentException("Email já cadastrado");
                    }
                    
                    // Validação de Username duplicado
                    if (updateRequest.getUsername() != null && 
                        !existingUserRole.getUsername().equals(updateRequest.getUsername()) && 
                        userRepository.existsByUsername(updateRequest.getUsername())) {
                        throw new IllegalArgumentException("Nome de usuário já cadastrado");
                    }

                    // Atualiza campos
                    if (updateRequest.getName() != null) {
                        existingUserRole.setName(updateRequest.getName());
                    }
                    if (updateRequest.getCpf() != null) {
                        existingUserRole.setCpf(updateRequest.getCpf());
                    }
                    if (updateRequest.getAddress() != null) {
                        existingUserRole.setAddress(updateRequest.getAddress());
                    }
                    if (updateRequest.getEmail() != null) {
                        existingUserRole.setEmail(updateRequest.getEmail());
                    }
                    if (updateRequest.getUsername() != null) {
                        existingUserRole.setUsername(updateRequest.getUsername());
                    }
                    // Só atualiza senha se foi informada (não vazia)
                    if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
                        existingUserRole.setPassword(updateRequest.getPassword());
                    }
                    if (updateRequest.getRole() != null) {
                        existingUserRole.setRole(updateRequest.getRole());
                    }
                    
                    return userRepository.save(existingUserRole);
                })
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
