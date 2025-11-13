package com.group3.conduitedeprojet.dto;

import java.util.List;
import lombok.Data;

@Data
public class CreateProjectRequest {
  private String name;
  private String description;
  private UserDto user;

  /** List of collaborators, identified by email. */
  private List<String> collaborateurs;
}
