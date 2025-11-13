package com.group3.conduitedeprojet.models;

import com.group3.conduitedeprojet.dto.TaskDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Table(name = "tasks")
public class Task {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(columnDefinition = "text", nullable = true)
  private String description;

  @Column(columnDefinition = "text", nullable = true)
  private String definitionOfDone;

  @Column(nullable = false)
  private Status status;

  @ManyToOne(optional = false)
  @JoinColumn(
      name = "creator_id",
      nullable = false,
      foreignKey = @ForeignKey(name = "fk_project_creator"))
  private User creator;

  @ManyToOne(optional = false)
  private Project project;

  @ManyToOne(optional = false)
  private Issue issue;

  @ManyToOne
  @JoinColumn(name = "assignee_id", nullable = true, foreignKey = @ForeignKey(name = "fk_assignee"))
  private User assignee;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  private void onCreate() {
    this.createdAt = LocalDateTime.now();
  }

  public enum Status {
    TODO,
    IN_PROGRESS,
    DONE
  }

  public TaskDto toTaskDto() {
    return TaskDto.builder()
        .id(id)
        .title(title)
        .description(description)
        .status(status)
        .creatorId(creator.getId())
        .projectId(project.getId())
        .issueId(issue.getId())
        .definitionOfDone(definitionOfDone)
        .assigneeId(assignee != null ? assignee.getId() : null)
        .createdAt(createdAt)
        .build();
  }
}
