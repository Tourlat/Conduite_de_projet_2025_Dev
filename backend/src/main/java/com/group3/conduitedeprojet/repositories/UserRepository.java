package com.group3.conduitedeprojet.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.group3.conduitedeprojet.models.User;

public interface UserRepository extends JpaRepository<User, Long> {
  
}
