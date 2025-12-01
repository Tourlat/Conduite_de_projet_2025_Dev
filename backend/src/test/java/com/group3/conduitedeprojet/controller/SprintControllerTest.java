package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.group3.conduitedeprojet.dto.AuthResponse;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

class SprintControllerTest extends IntegrationTestWithDatabase {

  @Test
  void createSprint_requires_auth() throws Exception {
    var body =
        Map.of(
            "name",
            "Sprint 1",
            "startDate",
            "2025-01-01T00:00:00",
            "endDate",
            "2025-01-14T23:59:59");

    mockMvc
        .perform(
            post("/api/projects/00000000-0000-0000-0000-000000000000/sprints")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void createSprint_success_creates_sprint() throws Exception {
    var owner = register("sprintowner@example.com", "password123", "SprintOwner");

    var createProjectBody =
        Map.of(
            "name",
            "Project With Sprint",
            "description",
            "desc",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var projectRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createProjectBody)))
            .andExpect(status().isOk())
            .andReturn();

    String projectJson = projectRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> projectMap = objectMapper.readValue(projectJson, Map.class);
    String projectId = (String) projectMap.get("id");

    var sprintBody =
        Map.of(
            "name",
            "Sprint 1",
            "startDate",
            "2025-01-01T00:00:00",
            "endDate",
            "2025-01-14T23:59:59",
            "issueIds",
            List.of());

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/sprints")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sprintBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name").value("Sprint 1"))
        .andExpect(jsonPath("$.startDate").value("2025-01-01T00:00:00"))
        .andExpect(jsonPath("$.endDate").value("2025-01-14T23:59:59"))
        .andExpect(jsonPath("$.projectId").value(projectId))
        .andExpect(jsonPath("$.issueIds").isArray())
        .andExpect(jsonPath("$.createdAt").isNotEmpty());
  }

  @Test
  void createSprint_with_issues_assigns_issues_to_sprint() throws Exception {
    var owner = register("sprintissueowner@example.com", "password123", "SprintIssueOwner");

    String projectId = createProject(owner);
    Long issueId1 = createIssue(projectId, owner.getToken(), "Issue 1");
    Long issueId2 = createIssue(projectId, owner.getToken(), "Issue 2");

    var sprintBody =
        Map.of(
            "name",
            "Sprint With Issues",
            "startDate",
            "2025-01-01T00:00:00",
            "endDate",
            "2025-01-14T23:59:59",
            "issueIds",
            List.of(issueId1, issueId2));

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/sprints")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sprintBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.issueIds.length()").value(2))
        .andExpect(jsonPath("$.issueIds[0]").value(issueId1.intValue()))
        .andExpect(jsonPath("$.issueIds[1]").value(issueId2.intValue()));
  }

  @Test
  void createSprint_unauthorized_user_forbidden() throws Exception {
    var owner = register("sprintowner2@example.com", "password123", "SprintOwner2");
    var attacker = register("sprintattacker@example.com", "password123", "SprintAttacker");

    String projectId = createProject(owner);

    var sprintBody =
        Map.of(
            "name",
            "Unauthorized Sprint",
            "startDate",
            "2025-01-01T00:00:00",
            "endDate",
            "2025-01-14T23:59:59");

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/sprints")
                .header("Authorization", "Bearer " + attacker.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(sprintBody)))
        .andExpect(status().isForbidden());
  }

  @Test
  void getSprintsByProject_success_returns_all_sprints() throws Exception {
    var owner = register("sprintlister@example.com", "password123", "SprintLister");
    String projectId = createProject(owner);

    for (int i = 1; i <= 3; i++) {
      var sprintBody =
          Map.of(
              "name",
              "Sprint " + i,
              "startDate",
              "2025-0" + i + "-01T00:00:00",
              "endDate",
              "2025-0" + i + "-14T23:59:59",
              "issueIds",
              List.of());

      mockMvc
          .perform(
              post("/api/projects/" + projectId + "/sprints")
                  .header("Authorization", "Bearer " + owner.getToken())
                  .contentType(MediaType.APPLICATION_JSON)
                  .content(objectMapper.writeValueAsString(sprintBody)))
          .andExpect(status().isOk());
    }

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/sprints")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(3))
        .andExpect(jsonPath("$[0].name").value("Sprint 1"))
        .andExpect(jsonPath("$[1].name").value("Sprint 2"))
        .andExpect(jsonPath("$[2].name").value("Sprint 3"));
  }

  @Test
  void getSprintsByProject_empty_returns_empty_list() throws Exception {
    var owner = register("sprintempty@example.com", "password123", "SprintEmpty");
    String projectId = createProject(owner);

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/sprints")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void getSprintById_success_returns_sprint() throws Exception {
    var owner = register("sprintgetter@example.com", "password123", "SprintGetter");
    String projectId = createProject(owner);
    Long sprintId = createSprint(projectId, owner.getToken(), "Sprint To Get");

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/sprints/" + sprintId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(sprintId.intValue()))
        .andExpect(jsonPath("$.name").value("Sprint To Get"));
  }

  @Test
  void updateSprint_success_updates_sprint() throws Exception {
    var owner = register("sprintupdater@example.com", "password123", "SprintUpdater");
    String projectId = createProject(owner);
    Long sprintId = createSprint(projectId, owner.getToken(), "Original Sprint Name");

    var updateBody =
        Map.of(
            "name",
            "Updated Sprint Name",
            "startDate",
            "2025-02-01T00:00:00",
            "endDate",
            "2025-02-28T23:59:59");

    mockMvc
        .perform(
            put("/api/projects/" + projectId + "/sprints/" + sprintId)
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Updated Sprint Name"))
        .andExpect(jsonPath("$.startDate").value("2025-02-01T00:00:00"))
        .andExpect(jsonPath("$.endDate").value("2025-02-28T23:59:59"));
  }

  @Test
  void deleteSprint_success_deletes_sprint() throws Exception {
    var owner = register("sprintdeleter@example.com", "password123", "SprintDeleter");
    String projectId = createProject(owner);
    Long sprintId = createSprint(projectId, owner.getToken(), "Sprint To Delete");

    mockMvc
        .perform(
            delete("/api/projects/" + projectId + "/sprints/" + sprintId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/sprints")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void deleteSprint_detaches_issues() throws Exception {
    var owner = register("sprintdetach@example.com", "password123", "SprintDetach");
    String projectId = createProject(owner);
    Long issueId = createIssue(projectId, owner.getToken(), "Issue In Sprint");
    Long sprintId = createSprintWithIssues(projectId, owner.getToken(), "Sprint", List.of(issueId));

    mockMvc
        .perform(
            delete("/api/projects/" + projectId + "/sprints/" + sprintId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isNoContent());
  }

  @Test
  void getIssuesBySprint_success_returns_sprint_issues() throws Exception {
    var owner = register("sprintissues@example.com", "password123", "SprintIssues");
    String projectId = createProject(owner);
    Long issueId1 = createIssue(projectId, owner.getToken(), "Sprint Issue 1");
    Long issueId2 = createIssue(projectId, owner.getToken(), "Sprint Issue 2");
    Long sprintId =
        createSprintWithIssues(projectId, owner.getToken(), "Sprint", List.of(issueId1, issueId2));

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/sprints/" + sprintId + "/issues")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].id").value(issueId1.intValue()))
        .andExpect(jsonPath("$[1].id").value(issueId2.intValue()));
  }

  private String createProject(AuthResponse owner) throws Exception {
    var createProjectBody =
        Map.of(
            "name",
            "Test Project",
            "description",
            "Test description",
            "user",
            Map.of("id", owner.getId(), "email", owner.getEmail()));

    var projectRes =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createProjectBody)))
            .andExpect(status().isOk())
            .andReturn();

    String projectJson = projectRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> projectMap = objectMapper.readValue(projectJson, Map.class);
    return (String) projectMap.get("id");
  }

  private Long createIssue(String projectId, String token, String title) throws Exception {
    var issueBody =
        Map.of(
            "title",
            title,
            "description",
            "Test issue",
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
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issueBody)))
            .andExpect(status().isOk())
            .andReturn();

    String issueJson = issueRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> issueMap = objectMapper.readValue(issueJson, Map.class);
    return ((Number) issueMap.get("id")).longValue();
  }

  private Long createSprint(String projectId, String token, String name) throws Exception {
    var sprintBody =
        Map.of(
            "name",
            name,
            "startDate",
            "2025-01-01T00:00:00",
            "endDate",
            "2025-01-14T23:59:59",
            "issueIds",
            List.of());

    var sprintRes =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/sprints")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(sprintBody)))
            .andExpect(status().isOk())
            .andReturn();

    String sprintJson = sprintRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> sprintMap = objectMapper.readValue(sprintJson, Map.class);
    return ((Number) sprintMap.get("id")).longValue();
  }

  private Long createSprintWithIssues(
      String projectId, String token, String name, List<Long> issueIds) throws Exception {
    var sprintBody =
        Map.of(
            "name",
            name,
            "startDate",
            "2025-01-01T00:00:00",
            "endDate",
            "2025-01-14T23:59:59",
            "issueIds",
            issueIds);

    var sprintRes =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/sprints")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(sprintBody)))
            .andExpect(status().isOk())
            .andReturn();

    String sprintJson = sprintRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> sprintMap = objectMapper.readValue(sprintJson, Map.class);
    return ((Number) sprintMap.get("id")).longValue();
  }
}
