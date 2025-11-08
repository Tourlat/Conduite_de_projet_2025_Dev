package com.group3.conduitedeprojet.models;

import com.group3.conduitedeprojet.dto.IssueDto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
@Table(name = "issues")
public class Issue {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private Priority priority;

  @Column(nullable = false)
  private Integer storyPoints;

  @Column(columnDefinition = "text", nullable = true)
  private String description;

  @Column(nullable = false)
  private Status status = Status.TODO;

  @ManyToOne
  private Project project;

  @ManyToOne(optional = false)
  @JoinColumn(name = "creator_id", nullable = false,
      foreignKey = @ForeignKey(name = "fk_project_creator"))
  private User creator;

  @ManyToOne
  @JoinColumn(name = "assignee_id", nullable = true, foreignKey = @ForeignKey(name = "fk_assignee"))
  private User assignee;

  public enum Priority {
    LOW, MEDIUM, HIGH
  }

  public enum Status {
    TODO, IN_PROGRESS, CLOSED
  }

  public IssueDto toIssueDto() {
    IssueDto.IssueDtoBuilder builder =
        IssueDto.builder().id(id).title(title).priority(priority).status(status).description(description)
            .storyPoints(storyPoints).projectId(project.getId()).creatorId(creator.getId());

    if (assignee != null) {
      builder.assigneeId(assignee.getId());
    }

    return builder.build();
  }
}
