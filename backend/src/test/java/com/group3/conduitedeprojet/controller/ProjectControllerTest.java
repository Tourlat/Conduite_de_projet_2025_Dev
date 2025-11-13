package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.group3.conduitedeprojet.dto.UserDto;

public class ProjectControllerTest extends IntegrationTestWithDatabase {

  @Test
  void createProject_requires_auth() throws Exception {
    var body =
        Map.of(
            "name",
            "TestProj",
            "description",
            "desc",
            "user",
            Map.of("id", 1L, "email", "unknown@example.com"));

    mockMvc
        .perform(
            post("/api/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isForbidden());
  }

  @Test
  void createProject_success_creates_project() throws Exception {
    var auth = register("projowner@example.com", "password123", "Owner");

    var body =
        Map.of(
            "name",
            "Awesome Project",
            "description",
            "A sample project",
            "user",
            Map.of("id", auth.getId(), "email", auth.getEmail()));

    mockMvc
        .perform(
            post("/api/projects")
                .header("Authorization", "Bearer " + auth.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name").value("Awesome Project"))
        .andExpect(jsonPath("$.description").value("A sample project"))
        .andExpect(jsonPath("$.creator").exists());
  }

  @Test
  void addCollaborator_success() throws Exception {
    var owner = register("owner2@example.com", "password123", "Owner2");
    var collab = register("collab@example.com", "password123", "Collab");

    var createBody =
        Map.of(
            "name",
            "Project With Collab",
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

    var addBody = Map.of("collaborators", List.of(collab.getEmail()));

    String returnString =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/collaborators")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(addBody)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    List<UserDto> collaborators =
        Arrays.stream(objectMapper.readValue(returnString, UserDto[].class)).toList();

    List<String> emails = collaborators.stream().map(UserDto::getEmail).toList();

    Assertions.assertTrue(emails.contains("owner2@example.com"));
    Assertions.assertTrue(emails.contains("collab@example.com"));
  }

  @Test
  void addCollaborator_non_creator_forbidden() throws Exception {
    var owner = register("owner2b@example.com", "password123", "Owner2b");
    var collab = register("collabb@example.com", "password123", "Collabb");
    var attacker = register("attacker@example.com", "password123", "Attacker");

    var createBody =
        Map.of(
            "name",
            "Project With Collab 2",
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

    var addBody = Map.of("collaborators", List.of(collab.getEmail()));

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/collaborators")
                .header("Authorization", "Bearer " + attacker.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addBody)))
        .andExpect(status().isForbidden());
  }

  @Test
  void removeCollaborator_success() throws Exception {
    var owner = register("owner3@example.com", "password123", "Owner3");
    var collab1 = register("collab2@example.com", "password123", "Collab2");
    var collab2 = register("collab3@example.com", "password123", "Collab3");

    var createBody =
        Map.of(
            "name",
            "Project To Remove From",
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

    var addBody = Map.of("collaborators", List.of(collab1.getEmail(), collab2.getEmail()));

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/collaborators")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(3));

    String returnString =
        mockMvc
            .perform(
                delete("/api/projects/" + projectId + "/collaborators/" + collab1.getId())
                    .header("Authorization", "Bearer " + owner.getToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andReturn()
            .getResponse()
            .getContentAsString();

    List<UserDto> collaborators =
        Arrays.stream(objectMapper.readValue(returnString, UserDto[].class)).toList();

    List<String> emails = collaborators.stream().map(UserDto::getEmail).toList();

    Assertions.assertTrue(emails.contains(owner.getEmail()));
    Assertions.assertTrue(emails.contains(collab2.getEmail()));
  }

  @Test
  void removeCollaborator_non_creator_forbidden() throws Exception {
    var owner = register("owner3b@example.com", "password123", "Owner3b");
    var collab = register("collab2b@example.com", "password123", "Collab2b");
    var attacker = register("attacker2@example.com", "password123", "Attacker2");

    var createBody =
        Map.of(
            "name",
            "Project To Remove From 2",
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

    var addBody = Map.of("collaborators", List.of(collab.getEmail()));

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/collaborators")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addBody)))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            delete("/api/projects/" + projectId + "/collaborators/" + collab.getId())
                .header("Authorization", "Bearer " + attacker.getToken()))
        .andExpect(status().isForbidden());
  }

  @Test
  void updateProject_success_updates_project_settings() throws Exception {
    var owner = register("updater@example.com", "password123", "Updater");

    var createBody =
        Map.of(
            "name",
            "Initial Name",
            "description",
            "Initial Desc",
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

    var updateBody = Map.of("name", "Updated Name", "description", "Updated Description");

    mockMvc
        .perform(
            put("/api/projects/" + projectId)
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated Name"))
        .andExpect(jsonPath("$.description").value("Updated Description"));
  }

  @Test
  void updateProject_non_creator_forbidden() throws Exception {
    var owner = register("owner-update@example.com", "password123", "OwnerUpd");
    var attacker = register("attacker-update@example.com", "password123", "AttackerUpd");

    var createBody =
        Map.of(
            "name",
            "Name Before",
            "description",
            "Desc Before",
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

    var updateBody = Map.of("name", "Malicious Update");

    mockMvc
        .perform(
            put("/api/projects/" + projectId)
                .header("Authorization", "Bearer " + attacker.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isForbidden());
  }

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

  @Test
  void createTask_success_creates_task() throws Exception {
    var owner = register("taskowner@example.com", "password123", "TaskOwner");
    var assignee = register("assignee@example.com", "password123", "Assignee");

    var createBody =
        Map.of(
            "name",
            "Project For Task",
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
            "Issue For Task",
            "description",
            "Issue desc",
            "storyPoints",
            3,
            "priority",
            "LOW");

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

    var taskBody =
        Map.of(
            "title",
            "Task Title",
            "description",
            "Task description",
            "assigneeId",
            assignee.getId());

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/issues/" + issueId + "/tasks")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(taskBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.title").value("Task Title"))
        .andExpect(jsonPath("$.description").value("Task description"))
        .andExpect(jsonPath("$.assigneeId").value(assignee.getId().intValue()))
        .andExpect(jsonPath("$.issueId").value(issueId.intValue()));
  }
}
