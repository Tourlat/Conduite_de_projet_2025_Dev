package com.group3.conduitedeprojet.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
public class HelloController {

  @Value("${app.frontend.url}")
  private String frontendUrl;

  @GetMapping("/api/hello")
  public String hello() {
    return "Hello from backend";
  }
}
