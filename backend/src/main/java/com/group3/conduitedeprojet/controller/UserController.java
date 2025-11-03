package com.group3.conduitedeprojet.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.group3.conduitedeprojet.dto.ChangePasswordRequest;
import com.group3.conduitedeprojet.dto.ChangeUserRequest;
import com.group3.conduitedeprojet.dto.UserDto;
import com.group3.conduitedeprojet.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

  @Autowired
  UserService userService;

  @GetMapping
  public ResponseEntity<List<UserDto>> getAllUsers() {
    return ResponseEntity.ok(userService.findAllUsers());
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userService.findUser(id));
  }

  @PutMapping("/")
  public ResponseEntity<UserDto> updateUser(@RequestBody ChangeUserRequest user,
      Principal principal) {
    if (principal == null || !principal.getName().equals(user.getEmail())) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    UserDto updated = userService.updateUser(user);
    return ResponseEntity.ok(updated);
  }

  @PutMapping("/password")
  public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest req,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    userService.changePassword(principal.getName(), req.getCurrentPassword(), req.getNewPassword());
    return ResponseEntity.noContent().build();
  }
}
