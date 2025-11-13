package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.*;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.services.ProjectService;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

  @Autowired private ProjectService projectService;

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
  public ResponseEntity<ProjectResponse> updateProject(
      @PathVariable UUID projectId,
      @RequestBody UpdateProjectRequest updateProjectRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(
        projectService.updateProject(projectId, updateProjectRequest, principal));
  }

  @GetMapping("/{projectId}/collaborators")
  public ResponseEntity<List<UserDto>> getProjectCollaborators(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(projectService.getProjectCollaborators(projectId, principal));
  }

  @PostMapping("/{projectId}/collaborators")
  public ResponseEntity<List<UserDto>> addCollaboratorToProject(
      @PathVariable UUID projectId,
      @RequestBody AddCollaboratorsRequest addCollaboratorsRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        projectService.addCollaboratorsToProject(projectId, addCollaboratorsRequest, principal));
  }

  @DeleteMapping("/{projectId}/collaborators/{collaboratorId}")
  public ResponseEntity<List<UserDto>> removeCollaboratorFromProject(
      @PathVariable UUID projectId, @PathVariable Long collaboratorId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        projectService.removeCollaboratorFromProject(projectId, collaboratorId, principal));
  }

  @PostMapping("/{projectId}/issues")
  public ResponseEntity<IssueDto> createIssue(
      @PathVariable UUID projectId,
      @RequestBody CreateIssueRequest createIssueRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(projectService.createIssue(projectId, createIssueRequest, principal));
  }

  @GetMapping("/{projectId}/issues")
  public ResponseEntity<List<IssueDto>> getProjectIssues(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(projectService.getIssuesByProject(projectId, principal));
  }

  @DeleteMapping("/{projectId}/issues/{issueId}")
  public ResponseEntity<Void> deleteIssue(
      @PathVariable UUID projectId, @PathVariable Long issueId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    projectService.deleteIssue(projectId, issueId, principal);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{projectId}/issues/{issueId}")
  public ResponseEntity<IssueDto> updateIssue(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @RequestBody UpdateIssueRequest updateIssueRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        projectService.updateIssue(projectId, issueId, updateIssueRequest, principal));
  }

  @PostMapping("/{projectId}/issues/{issueId}/tasks")
  public ResponseEntity<TaskDto> createTask(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @RequestBody CreateTaskRequest createTaskRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        projectService.createTask(projectId, issueId, createTaskRequest, principal));
  }

  @GetMapping("/{projectId}/issues/{issueId}/tasks")
  public ResponseEntity<List<TaskDto>> getTasksByIssue(
      @PathVariable UUID projectId, @PathVariable Long issueId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(projectService.getTasksByIssue(projectId, issueId, principal));
  }

  @PutMapping("/{projectId}/issues/{issueId}/tasks/{taskId}")
  public ResponseEntity<TaskDto> updateTask(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @PathVariable Long taskId,
      @RequestBody CreateTaskRequest updateTaskRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        projectService.updateTask(projectId, issueId, taskId, updateTaskRequest, principal));
  }

  @DeleteMapping("/{projectId}/issues/{issueId}/tasks/{taskId}")
  public ResponseEntity<Void> deleteTask(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @PathVariable Long taskId,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    projectService.deleteTask(projectId, issueId, taskId, principal);
    return ResponseEntity.noContent().build();
  }
}
