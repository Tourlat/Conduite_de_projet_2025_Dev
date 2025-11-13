package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);

  List<User> findByName(String name);

  Optional<User> findById(Long id);
}
