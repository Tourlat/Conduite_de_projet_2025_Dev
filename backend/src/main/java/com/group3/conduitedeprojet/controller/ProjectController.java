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
                    schema = @Schema(implementation = ProjectResponse.class))),
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
  public ResponseEntity<List<ProjectResponse>> getAllProjects(Principal principal) {
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
                    schema = @Schema(implementation = ProjectResponse.class))),
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

  @Operation(
      summary = "Create a new issue in a project",
      description = "Creates a new issue within the specified project")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Issue successfully created",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = IssueDto.class))),
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
            description = "Forbidden - user not member of project",
            content = @Content),
        @ApiResponse(responseCode = "404", description = "Project not found", content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
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

  @Operation(
      summary = "Get all issues in a project",
      description = "Retrieves all issues associated with the specified project")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Issues successfully retrieved",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = IssueDto.class))),
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
  @GetMapping("/{projectId}/issues")
  public ResponseEntity<List<IssueDto>> getProjectIssues(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(projectService.getIssuesByProject(projectId, principal));
  }

  @Operation(
      summary = "Delete an issue from a project",
      description = "Deletes the specified issue from the project")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Issue successfully deleted"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
        @ApiResponse(
            responseCode = "403",
            description =
                "Forbidden - user not authorized to delete this issue (NotAuthorizedException)"),
        @ApiResponse(
            responseCode = "404",
            description =
                "Project or issue not found (ProjectNotFoundException, IssueNotFoundException)"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @DeleteMapping("/{projectId}/issues/{issueId}")
  public ResponseEntity<Void> deleteIssue(
      @PathVariable UUID projectId, @PathVariable Long issueId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    projectService.deleteIssue(projectId, issueId, principal);
    return ResponseEntity.noContent().build();
  }

  @Operation(
      summary = "Update an issue",
      description = "Updates the specified issue in the project")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Issue successfully updated",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = IssueDto.class))),
        @ApiResponse(
            responseCode = "400",
            description =
                "Invalid request data or issue doesn't belong to project (IssueDoesntBelongToProjectException)",
            content = @Content),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - user not authorized (NotAuthorizedException)",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description =
                "Project or issue not found (ProjectNotFoundException, IssueNotFoundException)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
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

  @Operation(
      summary = "Create a task for an issue",
      description = "Creates a new task within the specified issue")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Task successfully created",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TaskDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data or issue doesn't belong to project",
            content = @Content),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - user not member of project",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "Project or issue not found",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
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

  @Operation(
      summary = "Get all tasks for an issue",
      description = "Retrieves all tasks associated with the specified issue")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Tasks successfully retrieved",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TaskDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - user not member of project",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "Project or issue not found",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @GetMapping("/{projectId}/issues/{issueId}/tasks")
  public ResponseEntity<List<TaskDto>> getTasksByIssue(
      @PathVariable UUID projectId, @PathVariable Long issueId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(projectService.getTasksByIssue(projectId, issueId, principal));
  }

  @Operation(summary = "Update a task", description = "Updates the specified task")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Task successfully updated",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TaskDto.class))),
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
            description = "Forbidden - user not authorized",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "Project, issue, or task not found",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
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

  @Operation(summary = "Delete a task", description = "Deletes the specified task")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Task successfully deleted"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
        @ApiResponse(responseCode = "403", description = "Forbidden - user not authorized"),
        @ApiResponse(responseCode = "404", description = "Project, issue, or task not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
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
