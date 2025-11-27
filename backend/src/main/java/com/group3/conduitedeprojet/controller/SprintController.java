package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.CreateSprintRequest;
import com.group3.conduitedeprojet.dto.IssueDto;
import com.group3.conduitedeprojet.dto.SprintDto;
import com.group3.conduitedeprojet.dto.UpdateSprintRequest;
import com.group3.conduitedeprojet.services.SprintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/sprints")
public class SprintController {

  @Autowired private SprintService SprintService;

  @Operation(summary = "Create a sprint", description = "Creates a new sprint for a project")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Sprint successfully created",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SprintDto.class))),
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
            description = "Forbidden - user not authorized to create sprints",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "Project not found (ProjectNotFoundException)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @PostMapping
  public ResponseEntity<SprintDto> createSprint(
      @PathVariable UUID projectId,
      @RequestBody CreateSprintRequest createSprintRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(SprintService.createSprint(projectId, createSprintRequest, principal));
  }

  @Operation(
      summary = "Get all sprints for a project",
      description = "Retrieves all sprints for a specific project")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Sprints successfully retrieved",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SprintDto.class))),
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
            description = "Project not found (ProjectNotFoundException)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @GetMapping
  public ResponseEntity<List<SprintDto>> getSprintsByProject(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(SprintService.getSprintsByProject(projectId, principal));
  }

  @Operation(summary = "Get a sprint by ID", description = "Retrieves a specific sprint by its ID")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Sprint successfully retrieved",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SprintDto.class))),
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
            description =
                "Project or sprint not found (ProjectNotFoundException, SprintNotFoundException)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @GetMapping("/{sprintId}")
  public ResponseEntity<SprintDto> getSprintById(
      @PathVariable UUID projectId, @PathVariable Long sprintId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(SprintService.getSprintById(projectId, sprintId, principal));
  }

  @Operation(summary = "Update a sprint", description = "Updates the specified sprint")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Sprint successfully updated",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SprintDto.class))),
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
            description = "Forbidden - user not authorized (NotAuthorizedException)",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description =
                "Project or sprint not found (ProjectNotFoundException, SprintNotFoundException)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @PutMapping("/{sprintId}")
  public ResponseEntity<SprintDto> updateSprint(
      @PathVariable UUID projectId,
      @PathVariable Long sprintId,
      @RequestBody UpdateSprintRequest updateSprintRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        SprintService.updateSprint(projectId, sprintId, updateSprintRequest, principal));
  }

  @Operation(summary = "Delete a sprint", description = "Deletes the specified sprint")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Sprint successfully deleted"),
        @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required"),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - user not authorized (NotAuthorizedException)"),
        @ApiResponse(
            responseCode = "404",
            description =
                "Project or sprint not found (ProjectNotFoundException, SprintNotFoundException)"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @DeleteMapping("/{sprintId}")
  public ResponseEntity<Void> deleteSprint(
      @PathVariable UUID projectId, @PathVariable Long sprintId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    SprintService.deleteSprint(projectId, sprintId, principal);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/{sprintId}/issues")
  public ResponseEntity<List<IssueDto>> getIssuesBySprint(
      @PathVariable UUID projectId, @PathVariable Long sprintId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(SprintService.getIssuesBySprint(projectId, sprintId, principal));
  }
}
