package com.group3.conduitedeprojet.dto;

import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class IssueDto {
    private Long id;

    private String title;

    private Issue.Priority priority;

    private Integer storyPoints;

    private String description;

    private Issue.Status status;

    private UUID projectId;

    private Long creatorId;

    private Long assigneeId;
}
