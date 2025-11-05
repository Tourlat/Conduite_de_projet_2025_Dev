package com.group3.conduitedeprojet.dto;

import java.util.List;
import lombok.Data;

@Data
public class AddCollaboratorsRequest {
  private List<String> collaborators;
}
