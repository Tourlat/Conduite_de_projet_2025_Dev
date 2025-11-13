package com.group3.conduitedeprojet.dto;

import com.group3.conduitedeprojet.models.Task;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskDto {
  private Long id;
  private String title;
  private String description;
  private String definitionOfDone;
  private Task.Status status;
  private Long creatorId;
  private UUID projectId;
  private Long issueId;
  private Long assigneeId;
  private LocalDateTime createdAt;
}
