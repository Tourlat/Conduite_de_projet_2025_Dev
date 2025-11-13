package com.group3.conduitedeprojet.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class UpdateSprintRequest {
  private String name;
  private LocalDateTime startDate;
  private LocalDateTime endDate;
  private List<Long> issueIds;
}