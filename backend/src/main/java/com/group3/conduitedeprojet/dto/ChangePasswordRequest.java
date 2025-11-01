package com.group3.conduitedeprojet.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
  private String currentPassword;
  private String newPassword;
}
