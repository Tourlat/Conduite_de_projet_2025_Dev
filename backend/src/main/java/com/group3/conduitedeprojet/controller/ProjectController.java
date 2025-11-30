package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.*;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.services.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Project management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

  @Autowired private ProjectService projectService;

  @Operation(
      summary = "Create a new project",
      description = "Creates a new project with the authenticated user as owner")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Project successfully created",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Project.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @PostMapping
  public ResponseEntity<Project> createProject(
      @RequestBody CreateProjectRequest createProjectRequest, Principal principal) {
    if (principal == null
        || !createProjectRequest.getUser().getEmail().equals(principal.getName())) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    return ResponseEntity.ok(projectService.createProject(createProjectRequest));
  }

  @Operation(
      summary = "Get all projects",
      description = "Retrieves all projects where the authenticated user is owner or collaborator")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Projects successfully retrieved",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @GetMapping
  public ResponseEntity<List<ProjectDto>> getAllProjects(Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(projectService.findProjectsByUser(principal.getName()));
  }

  @Operation(
      summary = "Update a project",
      description = "Updates project settings (only project owner can update)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Project successfully updated",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - only project owner can update",
            content = @Content),
        @ApiResponse(responseCode = "404", description = "Project not found", content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @PutMapping("/{projectId}")
  public ResponseEntity<ProjectDto> updateProject(
      @PathVariable UUID projectId,
      @RequestBody UpdateProjectRequest updateProjectRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(
        projectService.updateProject(projectId, updateProjectRequest, principal));
  }

  @Operation(
      summary = "Get project collaborators",
      description = "Retrieves all collaborators of a project")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Collaborators successfully retrieved",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - user not member of project",
            content = @Content),
        @ApiResponse(responseCode = "404", description = "Project not found", content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @GetMapping("/{projectId}/collaborators")
  public ResponseEntity<List<UserDto>> getProjectCollaborators(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    return ResponseEntity.ok(projectService.getProjectCollaborators(projectId, principal));
  }

  @Operation(
      summary = "Add collaborators to project",
      description = "Adds one or more collaborators to a project (only project owner)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Collaborators successfully added",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - only project owner can add collaborators",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "Project or user not found",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
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

  @Operation(
      summary = "Remove collaborator from project",
      description = "Removes a collaborator from a project (only project owner)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Collaborator successfully removed",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - only project owner can remove collaborators",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "Project or user not found",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @DeleteMapping("/{projectId}/collaborators/{collaboratorId}")
  public ResponseEntity<List<UserDto>> removeCollaboratorFromProject(
      @PathVariable UUID projectId, @PathVariable Long collaboratorId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        projectService.removeCollaboratorFromProject(projectId, collaboratorId, principal));
  }
}
