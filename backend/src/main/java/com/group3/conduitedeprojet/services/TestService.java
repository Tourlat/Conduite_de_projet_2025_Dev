package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.dto.CreateTestRequest;
import com.group3.conduitedeprojet.dto.TestDto;
import com.group3.conduitedeprojet.dto.UpdateTestRequest;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.Test;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.TestRepository;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestService {

  @Autowired private EntityLookupService entityLookupService;

  @Autowired private TestRepository testRepository;

  public TestDto createTest(
      UUID projectId, Long issueId, CreateTestRequest createTestRequest, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    User creator = entityLookupService.getUserByEmail(principal.getName());
    Issue issue = entityLookupService.getIssue(issueId);

    Test test =
        Test.builder()
            .creator(creator)
            .issue(issue)
            .programCode(createTestRequest.getProgramCode())
            .testCode(createTestRequest.getTestCode())
            .build();

    test = testRepository.save(test);

    return test.toTestDto();
  }

  public List<TestDto> getTestsForIssue(UUID projectId, Long issueId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    entityLookupService.getIssue(issueId);

    return testRepository.findByIssueId(issueId).stream().map(Test::toTestDto).toList();
  }

  public TestDto updateTest(
      UUID projectId,
      Long issueId,
      Long testId,
      UpdateTestRequest updateTestRequest,
      Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    entityLookupService.getIssue(issueId);
    Test test = entityLookupService.getTest(testId);

    test.setProgramCode(updateTestRequest.getProgramCode());
    test.setTestCode(updateTestRequest.getTestCode());

    return testRepository.save(test).toTestDto();
  }

  public void deleteTest(UUID projectId, Long issueId, Long testId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    entityLookupService.getIssue(issueId);
    Test test = entityLookupService.getTest(testId);
    testRepository.delete(test);
  }
}
