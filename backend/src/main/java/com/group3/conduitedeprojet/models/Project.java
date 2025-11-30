package com.group3.conduitedeprojet.models;

import com.group3.conduitedeprojet.dto.ProjectDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
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
@Table(name = "project")
public class Project {

  @Id @GeneratedValue private UUID id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = true)
  private String description;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  private void onCreate() {
    this.createdAt = LocalDateTime.now();
  }

  @ManyToOne
  @JoinColumn(
      name = "creator_id",
      nullable = false,
      foreignKey = @ForeignKey(name = "fk_project_creator"))
  private User creator;

  @ManyToMany
  @JoinTable(
      name = "project_user",
      joinColumns = @JoinColumn(name = "project_id"),
      inverseJoinColumns = @JoinColumn(name = "user_id"))
  private Set<User> collaborators;

  public ProjectDto toProjectDto() {
    return ProjectDto.builder()
        .id(id)
        .name(name)
        .description(description)
        .createdAt(createdAt)
        .creator(creator.toUserDto())
        .build();
  }
}
