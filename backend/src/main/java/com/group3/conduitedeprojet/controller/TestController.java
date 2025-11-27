package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.CreateTestRequest;
import com.group3.conduitedeprojet.dto.TestDto;
import com.group3.conduitedeprojet.dto.UpdateTestRequest;
import com.group3.conduitedeprojet.services.TestService;
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
@RequestMapping("/api/projects/{projectId}/issues/{issueId}/tests")
public class TestController {

  @Autowired private TestService testService;

  @PostMapping
  public ResponseEntity<TestDto> createTest(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @RequestBody CreateTestRequest createTestRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        testService.createTest(projectId, issueId, createTestRequest, principal));
  }

  @GetMapping
  public ResponseEntity<List<TestDto>> getTestsForIssue(
      @PathVariable UUID projectId, @PathVariable Long issueId, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(testService.getTestsForIssue(projectId, issueId, principal));
  }

  @PutMapping("/{testId}")
  public ResponseEntity<TestDto> updateTest(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @PathVariable Long testId,
      @RequestBody UpdateTestRequest updateTestRequest,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(
        testService.updateTest(projectId, issueId, testId, updateTestRequest, principal));
  }

  @DeleteMapping("/{testId}")
  public ResponseEntity<Void> deleteTest(
      @PathVariable UUID projectId,
      @PathVariable Long issueId,
      @PathVariable Long testId,
      Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    testService.deleteTest(projectId, issueId, testId, principal);
    return ResponseEntity.noContent().build();
  }
}
