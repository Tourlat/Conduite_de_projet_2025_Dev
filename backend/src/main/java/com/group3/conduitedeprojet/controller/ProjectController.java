package com.group3.conduitedeprojet.controller;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import com.group3.conduitedeprojet.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.Task;
import com.group3.conduitedeprojet.services.ProjectService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

  @Autowired
  private ProjectService projectService;

  @PostMapping
  public ResponseEntity<Project> createProject(
      @RequestBody CreateProjectRequest createProjectRequest, Principal principal) {
    if (principal == null
        || !createProjectRequest.getUser().getEmail().equals(principal.getName())) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    return ResponseEntity.ok(projectService.createProject(createProjectRequest));
  }

  @GetMapping
  public ResponseEntity<List<ProjectResponse>> getAllProjects(Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(projectService.findProjectsByUser(principal.getName()));
  }

  @PutMapping("/{projectId}")
  public ResponseEntity<ProjectResponse> updateProject(@PathVariable UUID projectId,
      @RequestBody UpdateProjectRequest updateProjectRequest, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity
        .ok(projectService.updateProject(projectId, updateProjectRequest, principal));
  }

  @GetMapping("/{projectId}/collaborators")
  public ResponseEntity<List<UserDto>> getProjectCollaborators(@PathVariable UUID projectId,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(projectService.getProjectCollaborators(projectId, principal));
  }

  @PostMapping("/{projectId}/collaborators")
  public ResponseEntity<List<UserDto>> addCollaboratorToProject(@PathVariable UUID projectId,
      @RequestBody AddCollaboratorsRequest addCollaboratorsRequest, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        projectService.addCollaboratorsToProject(projectId, addCollaboratorsRequest, principal));
  }

  @DeleteMapping("/{projectId}/collaborators/{collaboratorId}")
  public ResponseEntity<List<UserDto>> removeCollaboratorFromProject(@PathVariable UUID projectId,
      @PathVariable Long collaboratorId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity
        .ok(projectService.removeCollaboratorFromProject(projectId, collaboratorId, principal));
  }

  @PostMapping("/{projectId}/issues")
  public ResponseEntity<IssueDto> createIssue(@PathVariable UUID projectId,
      @RequestBody CreateIssueRequest createIssueRequest, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(projectService.createIssue(projectId, createIssueRequest, principal));
  }

  @PostMapping("/{projectId}/issues/{issueId}/tasks")
  public ResponseEntity<TaskDto> createTask(@PathVariable UUID projectId,
      @PathVariable Long issueId, @RequestBody CreateTaskRequest createTaskRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity
        .ok(projectService.createTask(projectId, issueId, createTaskRequest, principal));
  }
}
