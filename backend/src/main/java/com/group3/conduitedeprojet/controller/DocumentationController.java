package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.DocumentationDto;
import com.group3.conduitedeprojet.services.DocumentationService;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects/{projectId}/docs")
public class DocumentationController {

  @Autowired private DocumentationService documentationService;

  @GetMapping
  public ResponseEntity<List<DocumentationDto>> getDocumentation(@PathVariable UUID projectId) {
    return ResponseEntity.ok(documentationService.getDocumentationByProject(projectId));
  }

  @PostMapping
  public ResponseEntity<DocumentationDto> createDocumentation(
      @PathVariable UUID projectId, @RequestBody DocumentationDto dto) {
    return ResponseEntity.ok(documentationService.createDocumentation(projectId, dto));
  }

  @PutMapping("/{docId}")
  public ResponseEntity<DocumentationDto> updateDocumentation(
      @PathVariable UUID projectId, @PathVariable Long docId, @RequestBody DocumentationDto dto) {
    return ResponseEntity.ok(documentationService.updateDocumentation(docId, dto));
  }

  @DeleteMapping("/{docId}")
  public ResponseEntity<Void> deleteDocumentation(
      @PathVariable UUID projectId, @PathVariable Long docId) {
    documentationService.deleteDocumentation(docId);
    return ResponseEntity.noContent().build();
  }
}
