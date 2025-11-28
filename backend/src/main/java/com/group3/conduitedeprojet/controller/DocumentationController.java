package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.DocumentationDto;
import com.group3.conduitedeprojet.services.DocumentationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/docs")
@Tag(
    name = "Documentation Controller",
    description = "Handles documentation management for projects")
public class DocumentationController {

  @Autowired private DocumentationService documentationService;

  @Operation(
      summary = "Get documentation for a project",
      description = "Retrieves all documentation entries for the specified project")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved documentation"),
        @ApiResponse(responseCode = "404", description = "Project not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping
  public ResponseEntity<List<DocumentationDto>> getDocumentation(@PathVariable UUID projectId) {
    return ResponseEntity.ok(documentationService.getDocumentationByProject(projectId));
  }

  @Operation(
      summary = "Create documentation",
      description = "Creates a new documentation entry for the specified project")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Documentation successfully created"),
        @ApiResponse(responseCode = "404", description = "Project not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PostMapping
  public ResponseEntity<DocumentationDto> createDocumentation(
      @PathVariable UUID projectId, @RequestBody DocumentationDto dto) {
    return ResponseEntity.ok(documentationService.createDocumentation(projectId, dto));
  }

  @Operation(
      summary = "Update documentation",
      description = "Updates an existing documentation entry for the specified project")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Documentation successfully updated"),
        @ApiResponse(responseCode = "404", description = "Project or documentation not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PutMapping("/{docId}")
  public ResponseEntity<DocumentationDto> updateDocumentation(
      @PathVariable UUID projectId, @PathVariable Long docId, @RequestBody DocumentationDto dto) {
    return ResponseEntity.ok(documentationService.updateDocumentation(docId, dto));
  }

  @Operation(
      summary = "Delete documentation",
      description = "Deletes a documentation entry from the specified project")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Documentation successfully deleted"),
        @ApiResponse(responseCode = "404", description = "Project or documentation not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @DeleteMapping("/{docId}")
  public ResponseEntity<Void> deleteDocumentation(
      @PathVariable UUID projectId, @PathVariable Long docId) {
    documentationService.deleteDocumentation(docId);
    return ResponseEntity.noContent().build();
  }
}
