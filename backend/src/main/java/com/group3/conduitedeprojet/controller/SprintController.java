package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.CreateSprintRequest;
import com.group3.conduitedeprojet.dto.IssueDto;
import com.group3.conduitedeprojet.dto.SprintDto;
import com.group3.conduitedeprojet.dto.UpdateSprintRequest;
import com.group3.conduitedeprojet.services.SprintService;
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

  @GetMapping
  public ResponseEntity<List<SprintDto>> getSprintsByProject(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(SprintService.getSprintsByProject(projectId, principal));
  }

  @GetMapping("/{sprintId}")
  public ResponseEntity<SprintDto> getSprintById(
      @PathVariable UUID projectId, @PathVariable Long sprintId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(SprintService.getSprintById(projectId, sprintId, principal));
  }

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
