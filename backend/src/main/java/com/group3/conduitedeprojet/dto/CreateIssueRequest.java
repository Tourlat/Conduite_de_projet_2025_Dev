package com.group3.conduitedeprojet.dto;

import java.util.Optional;
import com.group3.conduitedeprojet.models.Issue;
import lombok.Data;

@Data
public class CreateIssueRequest {
    private String title;
    private String description;
    private Issue.Priority priority;
    private Integer storyPoints;
    private Issue.Status status = Issue.Status.TODO; 
    private Long assigneeId;
}
