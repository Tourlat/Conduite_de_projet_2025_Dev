package com.group3.conduitedeprojet.models;

import com.group3.conduitedeprojet.dto.TestDto;
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
@Table(name = "tests")
public class Test {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(columnDefinition = "text", nullable = false)
  private String programCode;

  @Column(columnDefinition = "text", nullable = false)
  private String testCode;

  @ManyToOne(optional = false)
  @JoinColumn(
      name = "creator_id",
      nullable = false,
      foreignKey = @ForeignKey(name = "fk_project_creator"))
  private User creator;

  @ManyToOne(optional = false)
  private Issue issue;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  private void onCreate() {
    this.createdAt = LocalDateTime.now();
  }

  public TestDto toTestDto() {
    return TestDto.builder()
        .creatorId(creator.getId())
        .id(id)
        .programCode(programCode)
        .testCode(testCode)
        .issueId(issue.getId())
        .createdAt(createdAt)
        .build();
  }
}
