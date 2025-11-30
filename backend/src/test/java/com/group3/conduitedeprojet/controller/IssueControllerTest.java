package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

public class IssueControllerTest extends IntegrationTestWithDatabase {
  @Test
  void updateProject_requires_auth_returns_unauthorized() throws Exception {
    var updateBody = Map.of("name", "Should Not Work");

    mockMvc
        .perform(
            put("/api/projects/" + "00000000-0000-0000-0000-000000000000")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void createIssue_success_creates_issue() throws Exception {
    var owner = register("issueowner@example.com", "password123", "IssueOwner");

    var createBody =
        Map.of(
            "name",
            "Project For Issue",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var issueBody =
        Map.of(
            "title",
            "Issue Title",
            "description",
            "Issue description",
            "storyPoints",
            5,
            "priority",
            "MEDIUM",
            "status",
            "TODO");

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/issues")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(issueBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.title").value("Issue Title"))
        .andExpect(jsonPath("$.storyPoints").value(5))
        .andExpect(jsonPath("$.priority").value("MEDIUM"))
        .andExpect(jsonPath("$.status").value("TODO"));
  }

  @Test
  void getIssuesByProject_success_returns_all_issues() throws Exception {
    var owner = register("issueretriever@example.com", "password123", "IssueRetriever");

    var createBody =
        Map.of(
            "name",
            "Project With Issues",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    for (int i = 1; i <= 3; i++) {
      var issueBody =
          Map.of(
              "title",
              "Issue " + i,
              "description",
              "Description " + i,
              "storyPoints",
              i * 2,
              "priority",
              "MEDIUM",
              "status",
              "TODO");

      mockMvc
          .perform(
              post("/api/projects/" + projectId + "/issues")
                  .header("Authorization", "Bearer " + owner.getToken())
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(issueBody)))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(
            MockMvcRequestBuilders.get("/api/projects/" + projectId + "/issues")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(3))
        .andExpect(jsonPath("$[0].title").value("Issue 1"))
        .andExpect(jsonPath("$[1].title").value("Issue 2"))
        .andExpect(jsonPath("$[2].title").value("Issue 3"));
  }

  @Test
  void getIssuesByProject_unauthorized_user_forbidden() throws Exception {
    var owner = register("issueowner2@example.com", "password123", "IssueOwner2");
    var attacker = register("issueattacker@example.com", "password123", "IssueAttacker");

    var createBody =
        Map.of(
            "name",
            "Private Project",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    mockMvc
        .perform(
            MockMvcRequestBuilders.get("/api/projects/" + projectId + "/issues")
                .header("Authorization", "Bearer " + attacker.getToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void getIssuesByProject_empty_returns_empty_list() throws Exception {
    var owner = register("issueowner3@example.com", "password123", "IssueOwner3");

    var createBody =
        Map.of(
            "name",
            "Empty Project",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    mockMvc
        .perform(
            MockMvcRequestBuilders.get("/api/projects/" + projectId + "/issues")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void getIssuesByProject_requires_auth() throws Exception {
    mockMvc
        .perform(
            MockMvcRequestBuilders.get(
                "/api/projects/" + "00000000-0000-0000-0000-000000000000" + "/issues"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void updateIssue_success_updates_issue() throws Exception {
    var owner = register("issueupdate@example.com", "password123", "IssueUpdater");

    var createBody =
        Map.of(
            "name",
            "Project For Update",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var issueBody =
        Map.of(
            "title",
            "Original Title",
            "description",
            "Original description",
            "storyPoints",
            5,
            "priority",
            "MEDIUM",
            "status",
            "TODO");

    var issueRes =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issueBody)))
            .andExpect(status().isOk())
            .andReturn();

    String issueJson = issueRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> issueMap = objectMapper.readValue(issueJson, Map.class);
    Long issueId = ((Number) issueMap.get("id")).longValue();

    var updateBody =
        Map.of(
            "title",
            "Updated Title",
            "description",
            "Updated description",
            "storyPoints",
            8,
            "priority",
            "HIGH",
            "status",
            "IN_PROGRESS");

    mockMvc
        .perform(
            put("/api/projects/" + projectId + "/issues/" + issueId)
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Updated Title"))
        .andExpect(jsonPath("$.description").value("Updated description"))
        .andExpect(jsonPath("$.storyPoints").value(8))
        .andExpect(jsonPath("$.priority").value("HIGH"))
        .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
  }

  @Test
  void updateIssue_partial_update_only_status() throws Exception {
    var owner = register("partialupdate@example.com", "password123", "PartialUpdater");

    var createBody =
        Map.of(
            "name",
            "Project For Partial",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var issueBody =
        Map.of(
            "title",
            "Test Issue",
            "description",
            "Test",
            "storyPoints",
            5,
            "priority",
            "MEDIUM",
            "status",
            "TODO");

    var issueRes =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issueBody)))
            .andExpect(status().isOk())
            .andReturn();

    String issueJson = issueRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> issueMap = objectMapper.readValue(issueJson, Map.class);
    Long issueId = ((Number) issueMap.get("id")).longValue();

    var updateBody = Map.of("status", "CLOSED");

    mockMvc
        .perform(
            put("/api/projects/" + projectId + "/issues/" + issueId)
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Test Issue"))
        .andExpect(jsonPath("$.status").value("CLOSED"));
  }

  @Test
  void deleteIssue_success_deletes_issue() throws Exception {
    var owner = register("issuedeleter@example.com", "password123", "IssueDeleter");

    var createBody =
        Map.of(
            "name",
            "Project For Delete",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var issueBody =
        Map.of(
            "title",
            "Issue To Delete",
            "description",
            "Delete me",
            "storyPoints",
            3,
            "priority",
            "LOW",
            "status",
            "TODO");

    var issueRes =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issueBody)))
            .andExpect(status().isOk())
            .andReturn();

    String issueJson = issueRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> issueMap = objectMapper.readValue(issueJson, Map.class);
    Long issueId = ((Number) issueMap.get("id")).longValue();

    mockMvc
        .perform(
            delete("/api/projects/" + projectId + "/issues/" + issueId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            MockMvcRequestBuilders.get("/api/projects/" + projectId + "/issues")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void deleteIssue_unauthorized_user_forbidden() throws Exception {
    var owner = register("issueowner-del@example.com", "password123", "IssueOwnerDel");
    var attacker = register("attacker-del@example.com", "password123", "AttackerDel");

    var createBody =
        Map.of(
            "name",
            "Project For Delete Attack",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createBody)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var issueBody =
        Map.of(
            "title",
            "Protected Issue",
            "description",
            "Protected",
            "storyPoints",
            5,
            "priority",
            "HIGH",
            "status",
            "TODO");

    var issueRes =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issueBody)))
            .andExpect(status().isOk())
            .andReturn();

    String issueJson = issueRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> issueMap = objectMapper.readValue(issueJson, Map.class);
    Long issueId = ((Number) issueMap.get("id")).longValue();

    mockMvc
        .perform(
            delete("/api/projects/" + projectId + "/issues/" + issueId)
                .header("Authorization", "Bearer " + attacker.getToken()))
        .andExpect(status().isForbidden());
  }
}
