package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.dto.CreateSprintRequest;
import com.group3.conduitedeprojet.dto.IssueDto;
import com.group3.conduitedeprojet.dto.SprintDto;
import com.group3.conduitedeprojet.dto.UpdateSprintRequest;
import com.group3.conduitedeprojet.exceptions.NotAuthorizedException;
import com.group3.conduitedeprojet.exceptions.SprintNotFoundException;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.Sprint;
import com.group3.conduitedeprojet.repositories.IssueRepository;
import com.group3.conduitedeprojet.repositories.SprintRepository;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SprintService {

  @Autowired private SprintRepository sprintRepository;
  @Autowired private IssueRepository issueRepository;

  @Autowired private EntityLookupService entityLookupService;

  private void assignIssuesToSprint(UUID projectId, List<Long> issueIds, Sprint sprint) {
    if (issueIds == null || issueIds.isEmpty()) {
      return;
    }

    for (Long issueId : issueIds) {
      Issue issue = entityLookupService.getIssue(issueId);
      if (!issue.getProject().getId().equals(projectId)) {
        throw new NotAuthorizedException("Issue does not belong to this project");
      }
      issue.setSprint(sprint);
      sprint.getIssues().add(issue);
      issueRepository.save(issue);
    }
  }

  public SprintDto createSprint(
      UUID projectId, CreateSprintRequest createSprintRequest, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    Sprint sprint =
        Sprint.builder()
            .name(createSprintRequest.getName())
            .startDate(createSprintRequest.getStartDate())
            .endDate(createSprintRequest.getEndDate())
            .project(project)
            .build();

    sprint = sprintRepository.save(sprint);

    assignIssuesToSprint(projectId, createSprintRequest.getIssueIds(), sprint);

    return sprint.toSprintDto();
  }

  public List<SprintDto> getSprintsByProject(UUID projectId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    return sprintRepository.findByProjectId(projectId).stream().map(Sprint::toSprintDto).toList();
  }

  public SprintDto getSprintById(UUID projectId, Long sprintId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    Sprint sprint =
        sprintRepository
            .findByIdAndProjectId(sprintId, projectId)
            .orElseThrow(() -> new NotAuthorizedException("Sprint not found in this project"));

    return sprint.toSprintDto();
  }

  public void deleteSprint(UUID projectId, Long sprintId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    Sprint sprint =
        sprintRepository
            .findByIdAndProjectId(sprintId, projectId)
            .orElseThrow(() -> new NotAuthorizedException("Sprint not found in this project"));

    List<Issue> issuesInSprint = issueRepository.findBySprintId(sprintId);
    for (Issue issue : issuesInSprint) {
      issue.setSprint(null);
      issueRepository.save(issue);
    }

    sprintRepository.delete(sprint);
  }

  public SprintDto updateSprint(
      UUID projectId, Long sprintId, UpdateSprintRequest updateSprintRequest, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    Sprint sprint =
        sprintRepository
            .findByIdAndProjectId(sprintId, projectId)
            .orElseThrow(() -> new SprintNotFoundException("Sprint not found"));

    if (updateSprintRequest.getName() != null) {
      sprint.setName(updateSprintRequest.getName());
    }
    if (updateSprintRequest.getStartDate() != null) {
      sprint.setStartDate(updateSprintRequest.getStartDate());
    }
    if (updateSprintRequest.getEndDate() != null) {
      sprint.setEndDate(updateSprintRequest.getEndDate());
    }

    if (updateSprintRequest.getIssueIds() != null) {
      for (Issue issue : sprint.getIssues()) {
        issue.setSprint(null);
        issueRepository.save(issue);
      }

      assignIssuesToSprint(projectId, updateSprintRequest.getIssueIds(), sprint);
    }

    sprintRepository.save(sprint);
    return sprint.toSprintDto();
  }

  public List<IssueDto> getIssuesBySprint(UUID projectId, Long sprintId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    sprintRepository
        .findByIdAndProjectId(sprintId, projectId)
        .orElseThrow(() -> new SprintNotFoundException("Sprint not found"));

    return issueRepository.findBySprintId(sprintId).stream().map(Issue::toIssueDto).toList();
  }
}
