package com.group3.conduitedeprojet.controller;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import com.group3.conduitedeprojet.dto.AddCollaboratorsRequest;
import com.group3.conduitedeprojet.dto.CreateProjectRequest;
import com.group3.conduitedeprojet.dto.ProjectResponse;
import com.group3.conduitedeprojet.dto.UpdateProjectRequest;
import com.group3.conduitedeprojet.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.group3.conduitedeprojet.models.Project;
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
    return ResponseEntity.ok(projectService.updateProject(projectId, updateProjectRequest, principal));
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
}
