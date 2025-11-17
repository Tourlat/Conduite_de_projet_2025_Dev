package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.CreateReleaseRequest;
import com.group3.conduitedeprojet.dto.ReleaseDto;
import com.group3.conduitedeprojet.services.ReleaseService;
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
public class ReleaseController {

  @Autowired private ReleaseService releaseService;

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

  @GetMapping
  public ResponseEntity<List<ReleaseDto>> getReleases(
      @PathVariable UUID projectId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(releaseService.getReleases(projectId, principal));
  }
}
