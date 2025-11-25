package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.DocumentationIssueDto;
import com.group3.conduitedeprojet.services.DocumentationIssueService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documentation-issues")
public class DocumentationIssueController {

  @Autowired private DocumentationIssueService documentationIssueService;

  @GetMapping("/documentation/{documentationId}")
  public ResponseEntity<List<DocumentationIssueDto>> getIssuesByDocumentation(
      @PathVariable Long documentationId) {
    return ResponseEntity.ok(
        documentationIssueService.getIssuesByDocumentation(documentationId));
  }

  @GetMapping("/issue/{issueId}")
  public ResponseEntity<List<DocumentationIssueDto>> getDocumentationsByIssue(
      @PathVariable Long issueId) {
    return ResponseEntity.ok(documentationIssueService.getDocumentationsByIssue(issueId));
  }

  @PostMapping("/documentation/{documentationId}/issue/{issueId}")
  public ResponseEntity<DocumentationIssueDto> linkDocumentationToIssue(
      @PathVariable Long documentationId, @PathVariable Long issueId) {
    DocumentationIssueDto result =
        documentationIssueService.linkDocumentationToIssue(documentationId, issueId);
    return ResponseEntity.status(HttpStatus.CREATED).body(result);
  }

  @DeleteMapping("/documentation/{documentationId}/issue/{issueId}")
  public ResponseEntity<Void> unlinkDocumentationFromIssue(
      @PathVariable Long documentationId, @PathVariable Long issueId) {
    documentationIssueService.unlinkDocumentationFromIssue(documentationId, issueId);
    return ResponseEntity.noContent().build();
  }
}
