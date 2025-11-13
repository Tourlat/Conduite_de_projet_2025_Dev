package com.group3.conduitedeprojet.models;

import com.group3.conduitedeprojet.dto.SprintDto;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Table(name = "sprints")
public class Sprint {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(name = "start_date", nullable = false)
  private LocalDateTime startDate;

  @Column(name = "end_date", nullable = false)
  private LocalDateTime endDate;

  @ManyToOne(optional = false)
  @JoinColumn(
      name = "project_id",
      nullable = false,
      foreignKey = @ForeignKey(name = "fk_sprint_project"))
  private Project project;

  @OneToMany(mappedBy = "sprint", cascade = CascadeType.ALL)
  @Builder.Default
  private List<Issue> issues = new ArrayList<>();

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  private void onCreate() {
    this.createdAt = LocalDateTime.now();
  }

  public SprintDto toSprintDto() {
    return SprintDto.builder()
        .id(id)
        .name(name)
        .startDate(startDate)
        .endDate(endDate)
        .projectId(project.getId())
        .issueIds(issues.stream().map(Issue::getId).toList())
        .createdAt(createdAt)
        .build();
  }
}