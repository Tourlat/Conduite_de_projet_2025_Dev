package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.AuthResponse;
import com.group3.conduitedeprojet.dto.LoginRequest;
import com.group3.conduitedeprojet.dto.RegisterRequest;
import com.group3.conduitedeprojet.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication Controller", description = "Handles user registration and login")
public class AuthController {

  @Autowired private AuthService authService;

  @Operation(
      summary = "Register a new user",
      description = "Creates a new user account and returns a JWT token")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "User successfully registered",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request (missing or incorrect data)",
            content = @Content),
        @ApiResponse(
            responseCode = "409",
            description = "Conflict (email or username already exists)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
  }

  @Operation(summary = "Login user", description = "Authenticates a user and returns a JWT token")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "User successfully authenticated",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AuthResponse.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request (missing data)",
            content = @Content),
        @ApiResponse(responseCode = "401", description = "Invalid credentials", content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }
}
