package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.dto.CreateReleaseRequest;
import com.group3.conduitedeprojet.dto.ReleaseDto;
import com.group3.conduitedeprojet.exceptions.IssueDoesntBelongToProjectException;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.Release;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.ReleaseRepository;
import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReleaseService {

  @Autowired private EntityLookupService entityLookupService;

  @Autowired private ReleaseRepository releaseRepository;

  public ReleaseDto createRelease(
      UUID projectId, CreateReleaseRequest createReleaseRequest, Principal principal) {
    User creator = entityLookupService.getUserByEmail(principal.getName());
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    Set<Issue> issues = getIssues(createReleaseRequest.getIssueIds());
    checkIssuesBelongToProject(issues, projectId);

    Release release =
        Release.builder()
            .creator(creator)
            .project(project)
            .releaseNotes(createReleaseRequest.getReleaseNotes())
            .version(createReleaseRequest.getVersion())
            .issues(issues)
            .build();

    return releaseRepository.save(release).toReleaseDto();
  }

  public List<ReleaseDto> getReleases(UUID projectId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    return releaseRepository.findByProjectId(projectId).stream()
        .map(Release::toReleaseDto)
        .toList();
  }

  private Set<Issue> getIssues(List<Long> issueIds) {
    if (issueIds == null) {
      return new HashSet<>();
    }

    return new HashSet<>(issueIds)
        .stream().map(issueId -> entityLookupService.getIssue(issueId)).collect(Collectors.toSet());
  }

  private void checkIssuesBelongToProject(Set<Issue> issues, UUID projectId) {
    boolean allIssuesBelongToProject =
        issues.stream().allMatch(issue -> issue.getProject().getId().equals(projectId));

    if (!allIssuesBelongToProject) {
      throw new IssueDoesntBelongToProjectException(
          "Some given objects don't belong to the current project with id " + projectId);
    }
  }
}
