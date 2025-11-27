package com.group3.conduitedeprojet.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TestDto {
  private Long id;
  private String programCode;
  private String testCode;
  private Long creatorId;
  private Long issueId;
  private LocalDateTime createdAt;
}
