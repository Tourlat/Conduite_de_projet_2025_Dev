package com.group3.conduitedeprojet.models;

import com.group3.conduitedeprojet.dto.ReleaseDto;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Table(name = "release")
public class Release {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Embedded private Version version;

  @Column(columnDefinition = "text", nullable = true)
  private String releaseNotes;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @ManyToOne(optional = false)
  private Project project;

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

  @OneToMany @Builder.Default private Set<Issue> issues = new HashSet<>();

  @Embeddable
  public static class Version {
    private int major;
    private int minor;
    private int patch;
  }

  public ReleaseDto toReleaseDto() {
    return ReleaseDto.builder()
        .createdAt(createdAt)
        .creatorId(creator.getId())
        .id(id)
        .version(version)
        .releaseNotes(releaseNotes)
        .projectId(project.getId())
        .issueIds(issues.stream().map(Issue::getId).collect(Collectors.toSet()))
        .build();
  }
}
