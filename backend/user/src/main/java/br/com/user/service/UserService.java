package br.com.user.service;

import br.com.user.dto.UserUpdateRequest;
import br.com.user.entity.UserRole;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserRole createUser(UserRole userRole);

    Optional<UserRole> getUserById(Long id);

    List<UserRole> getAllUsers();

    UserRole updateUser(Long id, UserUpdateRequest updateRequest);

    void deleteUser(Long id);
}
