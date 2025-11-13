package com.group3.conduitedeprojet.dto;

import lombok.Data;

@Data
public class ChangeUserRequest {
  private String email;
  private String name;
}
