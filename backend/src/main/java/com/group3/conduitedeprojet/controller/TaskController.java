package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.CreateTaskRequest;
import com.group3.conduitedeprojet.dto.TaskDto;
import com.group3.conduitedeprojet.services.TaskService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/issues/{issueId}/tasks")
@Tag(name = "Task", description = "Task management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

  @Autowired private TaskService taskService;

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
  @PostMapping
  public ResponseEntity<TaskDto> createTask(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @RequestBody CreateTaskRequest createTaskRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        taskService.createTask(projectId, issueId, createTaskRequest, principal));
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
  @GetMapping
  public ResponseEntity<List<TaskDto>> getTasksByIssue(
      @PathVariable UUID projectId, @PathVariable Long issueId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(taskService.getTasksByIssue(projectId, issueId, principal));
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
  @PutMapping("/{taskId}")
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
        taskService.updateTask(projectId, issueId, taskId, updateTaskRequest, principal));
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
  @DeleteMapping("/{taskId}")
  public ResponseEntity<Void> deleteTask(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @PathVariable Long taskId,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    taskService.deleteTask(projectId, issueId, taskId, principal);
    return ResponseEntity.noContent().build();
  }
}
