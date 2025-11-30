package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.group3.conduitedeprojet.dto.AuthResponse;
import com.group3.conduitedeprojet.dto.TestDto;
import com.group3.conduitedeprojet.models.Issue;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

public class TestControllerTest extends IntegrationTestWithDatabase {

  @Test
  void createTest_requires_auth() throws Exception {
    // arbitrary ids; request should fail at security layer
    String projectId = "00000000-0000-0000-0000-000000000000";
    long issueId = 1L;

    var body =
        Map.of(
            "programCode", "class A {}",
            "testCode", "assert true;");

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/issues/" + issueId + "/tests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void createTest_success_creates_test() throws Exception {
    var owner = register("testowner@example.com", "password123", "TestOwner");
    UUID projectId = createProject(owner, "TestProject", "TestDescription").getId();
    Long issueId =
        createIssue(
                projectId,
                owner,
                "Issue To Delete Test",
                "Test description",
                Issue.Priority.MEDIUM,
                5,
                Issue.Status.TODO)
            .getId();

    var body =
        Map.of(
            "programCode", "class A {}",
            "testCode", "assertTrue(true);");

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/issues/" + issueId + "/tests")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").isNumber())
        .andExpect(jsonPath("$.programCode").value("class A {}"))
        .andExpect(jsonPath("$.testCode").value("assertTrue(true);"))
        .andExpect(jsonPath("$.issueId").value(issueId.intValue()))
        .andExpect(jsonPath("$.creatorId").isNumber())
        .andExpect(jsonPath("$.createdAt").isNotEmpty());
  }

  @Test
  void createTest_unauthorized_user_forbidden() throws Exception {
    var owner = register("testowner2@example.com", "password123", "TestOwner2");
    var attacker = register("testattacker@example.com", "password123", "TestAttacker");

    UUID projectId = createProject(owner, "TestProject", "TestDescription").getId();
    Long issueId =
        createIssue(
                projectId,
                owner,
                "Issue To Delete Test",
                "Test description",
                Issue.Priority.MEDIUM,
                5,
                Issue.Status.TODO)
            .getId();

    var body =
        Map.of(
            "programCode", "class B {}",
            "testCode", "assertEquals(1, 1);");

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/issues/" + issueId + "/tests")
                .header("Authorization", "Bearer " + attacker.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isForbidden());
  }

  @Test
  void getTestsForIssue_success_returns_all() throws Exception {
    var owner = register("testlister@example.com", "password123", "TestLister");
    UUID projectId = createProject(owner, "TestProject", "TestDescription").getId();
    Long issueId =
        createIssue(
                projectId,
                owner,
                "Issue To Delete Test",
                "Test description",
                Issue.Priority.MEDIUM,
                5,
                Issue.Status.TODO)
            .getId();

    // Create 2 tests
    createTest(projectId, owner, issueId, "class C {}", "assertNotNull(new Object());");
    createTest(projectId, owner, issueId, "class D {}", "assertFalse(false);");

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/issues/" + issueId + "/tests")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].programCode").value("class C {}"))
        .andExpect(jsonPath("$[0].testCode").value("assertNotNull(new Object());"))
        .andExpect(jsonPath("$[1].programCode").value("class D {}"))
        .andExpect(jsonPath("$[1].testCode").value("assertFalse(false);"));
  }

  @Test
  void updateTest_success_updates_test() throws Exception {
    var owner = register("testupdater@example.com", "password123", "TestUpdater");
    UUID projectId = createProject(owner, "TestProject", "TestDescription").getId();
    Long issueId =
        createIssue(
                projectId,
                owner,
                "Issue To Delete Test",
                "Test description",
                Issue.Priority.MEDIUM,
                5,
                Issue.Status.TODO)
            .getId();
    Long testId = createTest(projectId, owner, issueId, "class F {}", "assertNull(null);").getId();

    var updateBody =
        Map.of(
            "programCode", "class E { int x = 1; }",
            "testCode", "assertEquals(2, 1 + 1);");

    mockMvc
        .perform(
            put("/api/projects/" + projectId + "/issues/" + issueId + "/tests/" + testId)
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(testId.intValue()))
        .andExpect(jsonPath("$.programCode").value("class E { int x = 1; }"))
        .andExpect(jsonPath("$.testCode").value("assertEquals(2, 1 + 1);"));
  }

  @Test
  void deleteTest_success_deletes_test() throws Exception {
    var owner = register("testdeleter@example.com", "password123", "TestDeleter");
    UUID projectId = createProject(owner, "TestProject", "TestDescription").getId();
    Long issueId =
        createIssue(
                projectId,
                owner,
                "Issue To Delete Test",
                "Test description",
                Issue.Priority.MEDIUM,
                5,
                Issue.Status.TODO)
            .getId();
    Long testId = createTest(projectId, owner, issueId, "class F {}", "assertNull(null);").getId();

    mockMvc
        .perform(
            delete("/api/projects/" + projectId + "/issues/" + issueId + "/tests/" + testId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/issues/" + issueId + "/tests")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  private TestDto createTest(
      UUID projectId, AuthResponse authResponse, Long issueId, String programCode, String testCode)
      throws Exception {
    var body = Map.of("programCode", programCode, "testCode", testCode);

    var response =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues/" + issueId + "/tests")
                    .header("Authorization", "Bearer " + authResponse.ge)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isOk())
            .andReturn();

    return objectMapper.readValue(response.getResponse().getContentAsString(), TestDto.class);
  }
}
