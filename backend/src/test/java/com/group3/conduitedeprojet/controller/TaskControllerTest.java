package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

public class TaskControllerTest extends IntegrationTestWithDatabase {
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

  @Test
  void getTasksByIssue_success_returns_tasks() throws Exception {
    var owner = register("gettaskowner@example.com", "password123", "Owner");
    var assignee = register("getassignee@example.com", "password123", "Assignee");

    var createProject =
        Map.of(
            "name",
            "Project For Get Tasks",
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
                    .content(objectMapper.writeValueAsString(createProject)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var issueBody =
        Map.of(
            "title",
            "Issue For Get Tasks",
            "description",
            "Issue desc",
            "storyPoints",
            2,
            "priority",
            "MEDIUM");

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

    var task1 =
        Map.of("title", "Task One", "description", "First task", "assigneeId", assignee.getId());

    var task2 =
        Map.of("title", "Task Two", "description", "Second task", "assigneeId", assignee.getId());

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/issues/" + issueId + "/tasks")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(task1)))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/issues/" + issueId + "/tasks")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(task2)))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/issues/" + issueId + "/tasks")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].id").isNotEmpty())
        .andExpect(jsonPath("$[1].id").isNotEmpty());
  }

  @Test
  void updateTask_success_updates_task() throws Exception {
    var owner = register("updatetaskowner@example.com", "password123", "Owner");
    var assignee = register("updatetassignee@example.com", "password123", "Assignee");

    var createProject =
        Map.of(
            "name",
            "Project For Update Task",
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
                    .content(objectMapper.writeValueAsString(createProject)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var issueBody =
        Map.of(
            "title",
            "Issue For Update Task",
            "description",
            "Issue desc",
            "storyPoints",
            5,
            "priority",
            "HIGH");

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
            "Original Task",
            "description",
            "Original description",
            "assigneeId",
            assignee.getId());

    var taskRes =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues/" + issueId + "/tasks")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(taskBody)))
            .andExpect(status().isOk())
            .andReturn();

    String taskJson = taskRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> taskMap = objectMapper.readValue(taskJson, Map.class);
    Long taskId = ((Number) taskMap.get("id")).longValue();

    var updateBody =
        Map.of(
            "title",
            "Updated Task",
            "description",
            "Updated description",
            "assigneeId",
            owner.getId());

    mockMvc
        .perform(
            put("/api/projects/" + projectId + "/issues/" + issueId + "/tasks/" + taskId)
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(taskId.intValue()))
        .andExpect(jsonPath("$.title").value("Updated Task"))
        .andExpect(jsonPath("$.description").value("Updated description"))
        .andExpect(jsonPath("$.assigneeId").value(owner.getId().intValue()))
        .andExpect(jsonPath("$.issueId").value(issueId.intValue()));
  }

  @Test
  void deleteTask_success_deletes_task() throws Exception {
    var owner = register("deletetaskowner@example.com", "password123", "Owner");
    var assignee = register("deleteassignee@example.com", "password123", "Assignee");

    var createProject =
        Map.of(
            "name",
            "Project For Delete Task",
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
                    .content(objectMapper.writeValueAsString(createProject)))
            .andExpect(status().isOk())
            .andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var issueBody =
        Map.of(
            "title",
            "Issue For Delete Task",
            "description",
            "Issue desc",
            "storyPoints",
            1,
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
            "Task To Delete",
            "description",
            "Will be deleted",
            "assigneeId",
            assignee.getId());

    var taskRes =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues/" + issueId + "/tasks")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(taskBody)))
            .andExpect(status().isOk())
            .andReturn();

    String taskJson = taskRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> taskMap = objectMapper.readValue(taskJson, Map.class);
    Long taskId = ((Number) taskMap.get("id")).longValue();

    mockMvc
        .perform(
            delete("/api/projects/" + projectId + "/issues/" + issueId + "/tasks/" + taskId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isNoContent());

    // verify no tasks remain for the issue
    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/issues/" + issueId + "/tasks")
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }
}
