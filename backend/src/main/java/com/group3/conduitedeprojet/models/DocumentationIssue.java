package com.group3.conduitedeprojet.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Table(
    name = "documentation_issues",
    uniqueConstraints = {
      @UniqueConstraint(columnNames = {"documentation_id", "issue_id"})
    })
public class DocumentationIssue {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "documentation_id", nullable = false)
  private Documentation documentation;

  @ManyToOne
  @JoinColumn(name = "issue_id", nullable = false)
  private Issue issue;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
