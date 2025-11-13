package com.group3.conduitedeprojet.dto;

import com.group3.conduitedeprojet.models.Task;
import lombok.Data;

@Data
public class CreateTaskRequest {
  private String title;
  private String description;
  private String definitionOfDone;
  private Task.Status status;
  private Long assigneeId;
}
