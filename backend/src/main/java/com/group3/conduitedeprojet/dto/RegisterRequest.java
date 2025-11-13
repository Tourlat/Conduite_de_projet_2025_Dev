package com.group3.conduitedeprojet.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
  @NotBlank(message = "L'email ne peut pas être vide")
  @Email(message = "L'email doit être valide")
  private String email;

  @NotBlank(message = "Le mot de passe ne peut pas être vide")
  @Size(min = 8, max = 100, message = "Le mot de passe doit contenir entre 8 et 100 caractères")
  private String password;

  @NotBlank(message = "Le nom ne peut pas être vide")
  private String name;
}
