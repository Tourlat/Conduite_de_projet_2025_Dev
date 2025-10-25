package com.group3.conduitedeprojet.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.UserRepository;

@Service
public class UserService {
  
  @Autowired
  UserRepository userRepository;

  public List<User> findAll() {
    return userRepository.findAll();
  }

  public User create(User user) {
    return userRepository.save(user);
  }
}
