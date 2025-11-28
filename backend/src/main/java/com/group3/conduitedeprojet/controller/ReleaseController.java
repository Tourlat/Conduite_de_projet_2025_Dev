package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.CreateReleaseRequest;
import com.group3.conduitedeprojet.dto.ReleaseDto;
import com.group3.conduitedeprojet.services.ReleaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/releases")
@Tag(name = "Release Controller", description = "Handles release management for projects")
public class ReleaseController {

  @Autowired private ReleaseService releaseService;

  @Operation(
      summary = "Create release",
      description = "Creates a new release for the specified project")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Release successfully created"),
        @ApiResponse(responseCode = "404", description = "Project not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PostMapping
  public ResponseEntity<ReleaseDto> createRelease(
      @PathVariable UUID projectId,
      @RequestBody CreateReleaseRequest createReleaseRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        releaseService.createRelease(projectId, createReleaseRequest, principal));
  }

  @Operation(
      summary = "Get releases",
      description = "Retrieves all releases for the specified project")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved releases"),
        @ApiResponse(responseCode = "404", description = "Project not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping
  public ResponseEntity<List<ReleaseDto>> getReleases(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(releaseService.getReleases(projectId, principal));
  }
}
