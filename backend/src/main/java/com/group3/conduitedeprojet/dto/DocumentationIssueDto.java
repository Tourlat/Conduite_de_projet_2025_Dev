package com.group3.conduitedeprojet.dto;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class DocumentationIssueDto {
  private Long id;
  private Long documentationId;
  private Long issueId;
  private String issueTitle;
  private String issuePriority;
  private String issueStatus;
  private String createdAt;
}
