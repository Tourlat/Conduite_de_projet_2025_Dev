package com.group3.conduitedeprojet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
  @NotBlank(message = "L'email ne peut pas être vide")
  @Email(message = "L'email doit être valide")
  private String email;

  @NotBlank(message = "Le mot de passe ne peut pas être vide")
  private String password;
}
