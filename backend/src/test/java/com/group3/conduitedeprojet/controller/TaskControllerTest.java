package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
}
