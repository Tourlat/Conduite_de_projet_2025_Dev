package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.dto.CreateIssueRequest;
import com.group3.conduitedeprojet.dto.IssueDto;
import com.group3.conduitedeprojet.dto.UpdateIssueRequest;
import com.group3.conduitedeprojet.exceptions.IssueNotFoundException;
import com.group3.conduitedeprojet.exceptions.NotAuthorizedException;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.IssueRepository;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IssueService {

  @Autowired private IssueRepository issueRepository;

  @Autowired private EntityLookupService entityLookupService;

  public IssueDto createIssue(
      UUID projectId, CreateIssueRequest createIssueRequest, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    User creator = entityLookupService.getUserByEmail(principal.getName());

    Issue.IssueBuilder issueBuilder =
        Issue.builder()
            .title(createIssueRequest.getTitle())
            .description(createIssueRequest.getDescription())
            .storyPoints(createIssueRequest.getStoryPoints())
            .project(project)
            .priority(createIssueRequest.getPriority())
            .status(createIssueRequest.getStatus())
            .creator(creator);

    if (createIssueRequest.getAssigneeId() != null) {
      issueBuilder.assignee(entityLookupService.getUser(createIssueRequest.getAssigneeId()));
    }

    Issue issue = issueBuilder.build();
    issueRepository.save(issue);
    return issue.toIssueDto();
  }

  public List<IssueDto> getIssuesByProject(UUID projectId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);

    String userEmail = principal.getName();
    boolean hasAccess =
        project.getCreator().getEmail().equals(userEmail)
            || project.getCollaborators().stream().anyMatch(u -> u.getEmail().equals(userEmail));

    if (!hasAccess) {
      throw new NotAuthorizedException("You don't have access to this project");
    }

    return issueRepository.findByProjectId(projectId).stream().map(Issue::toIssueDto).toList();
  }

  public void deleteIssue(UUID projectId, Long issueId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    Optional<Issue> optionalIssue = issueRepository.findByIdAndProjectId(issueId, projectId);
    if (optionalIssue.isEmpty()) {
      throw new IssueNotFoundException(
          "Issue with id " + issueId + " was not found in project " + projectId);
    }

    issueRepository.delete(optionalIssue.get());
  }

  public IssueDto updateIssue(
      UUID projectId, Long issueId, UpdateIssueRequest updateIssueRequest, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    Optional<Issue> optionalIssue = issueRepository.findByIdAndProjectId(issueId, projectId);
    if (optionalIssue.isEmpty()) {
      throw new IssueNotFoundException(
          "Issue with id " + issueId + " was not found in project " + projectId);
    }

    Issue issue = optionalIssue.get();

    if (updateIssueRequest.getTitle() != null) {
      issue.setTitle(updateIssueRequest.getTitle());
    }
    if (updateIssueRequest.getDescription() != null) {
      issue.setDescription(updateIssueRequest.getDescription());
    }
    if (updateIssueRequest.getPriority() != null) {
      issue.setPriority(updateIssueRequest.getPriority());
    }
    if (updateIssueRequest.getStoryPoints() != null) {
      issue.setStoryPoints(updateIssueRequest.getStoryPoints());
    }
    if (updateIssueRequest.getStatus() != null) {
      issue.setStatus(updateIssueRequest.getStatus());
    }
    if (updateIssueRequest.getAssigneeId() != null) {
      Long assigneeId = updateIssueRequest.getAssigneeId();
      User user = entityLookupService.getUser(assigneeId);
      issue.setAssignee(user);
    }

    issueRepository.save(issue);
    return issue.toIssueDto();
  }
}
