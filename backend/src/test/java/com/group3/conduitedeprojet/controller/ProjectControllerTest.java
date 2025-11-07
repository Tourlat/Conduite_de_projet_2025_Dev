package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

public class ProjectControllerTest extends IntegrationTestWithDatabase {

  @Test
  void createProject_requires_auth() throws Exception {
    var body = Map.of("name", "TestProj", "description", "desc", "user",
        Map.of("id", 1L, "email", "unknown@example.com"));

    mockMvc.perform(post("/api/projects").contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(body))).andExpect(status().isForbidden());
  }

  @Test
  void createProject_success_creates_project() throws Exception {
    var auth = register("projowner@example.com", "password123", "Owner");

    var body = Map.of("name", "Awesome Project", "description", "A sample project", "user",
        Map.of("id", auth.getId(), "email", auth.getEmail()));

    mockMvc
        .perform(post("/api/projects").header("Authorization", "Bearer " + auth.getToken())
            .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isOk()).andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.name").value("Awesome Project"))
        .andExpect(jsonPath("$.description").value("A sample project"))
        .andExpect(jsonPath("$.creator").exists());
  }

  @Test
  void addCollaborator_success() throws Exception {
    var owner = register("owner2@example.com", "password123", "Owner2");
    var collab = register("collab@example.com", "password123", "Collab");

    var createBody = Map.of("name", "Project With Collab", "description", "desc", "user",
        Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes = mockMvc
        .perform(post("/api/projects").header("Authorization", "Bearer " + owner.getToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createBody)))
        .andExpect(status().isOk()).andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var addBody = Map.of("collaborators", List.of(collab.getEmail()));

    mockMvc.perform(post("/api/projects/" + projectId + "/collaborators")
        .header("Authorization", "Bearer " + owner.getToken())
        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(addBody)))
        .andExpect(status().isOk()).andExpect(jsonPath("$[0].email").value(collab.getEmail()));
  }

  @Test
  void addCollaborator_non_creator_forbidden() throws Exception {
    var owner = register("owner2b@example.com", "password123", "Owner2b");
    var collab = register("collabb@example.com", "password123", "Collabb");
    var attacker = register("attacker@example.com", "password123", "Attacker");

    var createBody = Map.of("name", "Project With Collab 2", "description", "desc", "user",
        Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes = mockMvc
        .perform(post("/api/projects").header("Authorization", "Bearer " + owner.getToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createBody)))
        .andExpect(status().isOk()).andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var addBody = Map.of("collaborators", List.of(collab.getEmail()));

    mockMvc.perform(post("/api/projects/" + projectId + "/collaborators")
        .header("Authorization", "Bearer " + attacker.getToken())
        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(addBody)))
        .andExpect(status().isForbidden());
  }

  @Test
  void removeCollaborator_success() throws Exception {
    var owner = register("owner3@example.com", "password123", "Owner3");
    var collab = register("collab2@example.com", "password123", "Collab2");

    var createBody = Map.of("name", "Project To Remove From", "description", "desc", "user",
        Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes = mockMvc
        .perform(post("/api/projects").header("Authorization", "Bearer " + owner.getToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createBody)))
        .andExpect(status().isOk()).andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var addBody = Map.of("collaborators", List.of(collab.getEmail()));

    mockMvc.perform(post("/api/projects/" + projectId + "/collaborators")
        .header("Authorization", "Bearer " + owner.getToken())
        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(addBody)))
        .andExpect(status().isOk()).andExpect(jsonPath("$[0].email").value(collab.getEmail()));

    mockMvc
        .perform(delete("/api/projects/" + projectId + "/collaborators/" + collab.getId())
            .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void removeCollaborator_non_creator_forbidden() throws Exception {
    var owner = register("owner3b@example.com", "password123", "Owner3b");
    var collab = register("collab2b@example.com", "password123", "Collab2b");
    var attacker = register("attacker2@example.com", "password123", "Attacker2");

    var createBody = Map.of("name", "Project To Remove From 2", "description", "desc", "user",
        Map.of("id", owner.getId(), "email", owner.getEmail()));

    var createRes = mockMvc
        .perform(post("/api/projects").header("Authorization", "Bearer " + owner.getToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createBody)))
        .andExpect(status().isOk()).andReturn();

    String createdJson = createRes.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> createdMap = objectMapper.readValue(createdJson, Map.class);
    String projectId = (String) createdMap.get("id");

    var addBody = Map.of("collaborators", List.of(collab.getEmail()));

    mockMvc.perform(post("/api/projects/" + projectId + "/collaborators")
        .header("Authorization", "Bearer " + owner.getToken())
        .contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(addBody)))
        .andExpect(status().isOk());

    mockMvc
        .perform(delete("/api/projects/" + projectId + "/collaborators/" + collab.getId())
            .header("Authorization", "Bearer " + attacker.getToken()))
        .andExpect(status().isForbidden());
  }
}
