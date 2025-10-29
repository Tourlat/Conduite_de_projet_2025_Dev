package com.group3.conduitedeprojet.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.group3.conduitedeprojet.models.User;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByName(String name);
}
