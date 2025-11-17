package com.group3.conduitedeprojet.dto;

import com.group3.conduitedeprojet.models.Release;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ReleaseDto {
  private Long id;
  private Release.Version version;
  private LocalDateTime createdAt;
  private String releaseNotes;
  private Long creatorId;
  private Set<Long> issueIds;
  private UUID projectId;
}
