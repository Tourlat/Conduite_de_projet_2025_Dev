package com.group3.conduitedeprojet.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
  private UUID id;
  private String name;
  private String description;
  private LocalDateTime createdAt;
  private UserDto creator;

  // @Data
  // @Builder
  // @NoArgsConstructor
  // @AllArgsConstructor
  // public static class CreatorDto {
  //   private Long id;
  //   private String email;
  //   private String name;
  // }
}
