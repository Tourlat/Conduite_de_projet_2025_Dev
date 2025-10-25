package com.group3.conduitedeprojet.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.services.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

  @Autowired
  UserService userService;

  @GetMapping("/findAll")
  public ResponseEntity<List<User>> findAll() {
    return ResponseEntity.ok(userService.findAll());
  }

  @PostMapping("/createUser")
    public ResponseEntity<User> create(@RequestBody User user) {
        return ResponseEntity.ok(userService.create(user));
    }
}
