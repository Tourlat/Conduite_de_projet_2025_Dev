package com.group3.conduitedeprojet.services;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;
import com.group3.conduitedeprojet.dto.ChangeUserRequest;
import com.group3.conduitedeprojet.dto.UserDto;
import com.group3.conduitedeprojet.exceptions.InvalidCredentialsException;
import com.group3.conduitedeprojet.exceptions.UserNotFoundException;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.UserRepository;

@Service
public class UserService {

  @Autowired
  UserRepository userRepository;

  @Autowired
  PasswordEncoder passwordEncoder;

  public UserDto findUser(@RequestParam Long id) {
    Optional<User> user = userRepository.findById(id);
    if (user.isPresent()) {
      return user.get().toUserDto();
    } else {
      throw new UserNotFoundException("User with given id was not found");
    }
  }

  public UserDto updateUser(ChangeUserRequest changeUserRequest) {
    User existing = userRepository.findByEmail(changeUserRequest.getEmail())
        .orElseThrow(() -> new UserNotFoundException("User with given email was not found"));

    existing.setName(changeUserRequest.getName());

    userRepository.save(existing);
    return existing.toUserDto();
  }

  public void changePassword(String email, String currentPassword, String newPassword) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found"));

    if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
      throw new InvalidCredentialsException("Current password is incorrect");
    }
    
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
  }
}
