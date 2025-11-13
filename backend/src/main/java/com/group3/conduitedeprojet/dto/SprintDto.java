package com.group3.conduitedeprojet.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SprintDto {
  private Long id;
  private String name;
  private LocalDateTime startDate;
  private LocalDateTime endDate;
  private UUID projectId;
  private List<Long> issueIds;
  private LocalDateTime createdAt;
}