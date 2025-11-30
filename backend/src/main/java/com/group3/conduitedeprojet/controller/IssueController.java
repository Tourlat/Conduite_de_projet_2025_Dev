package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.CreateIssueRequest;
import com.group3.conduitedeprojet.dto.IssueDto;
import com.group3.conduitedeprojet.dto.UpdateIssueRequest;
import com.group3.conduitedeprojet.services.IssueService;
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
@RequestMapping("/api/projects/{projectId}/issues")
@Tag(name = "Issues", description = "Issue management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class IssueController {

  @Autowired private IssueService issueService;

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
  @PostMapping
  public ResponseEntity<IssueDto> createIssue(
      @PathVariable UUID projectId,
      @RequestBody CreateIssueRequest createIssueRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(issueService.createIssue(projectId, createIssueRequest, principal));
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
  @GetMapping
  public ResponseEntity<List<IssueDto>> getProjectIssues(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(issueService.getIssuesByProject(projectId, principal));
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
  @DeleteMapping("/{issueId}")
  public ResponseEntity<Void> deleteIssue(
      @PathVariable UUID projectId, @PathVariable Long issueId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    issueService.deleteIssue(projectId, issueId, principal);
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
  @PutMapping("/{issueId}")
  public ResponseEntity<IssueDto> updateIssue(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @RequestBody UpdateIssueRequest updateIssueRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        issueService.updateIssue(projectId, issueId, updateIssueRequest, principal));
  }
}
