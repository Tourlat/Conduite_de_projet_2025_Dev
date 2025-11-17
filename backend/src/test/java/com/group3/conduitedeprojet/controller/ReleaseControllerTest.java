package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.group3.conduitedeprojet.dto.AuthResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

public class ReleaseControllerTest extends IntegrationTestWithDatabase {

  @Test
  void createRelease_requires_auth() throws Exception {
    var body =
        Map.of(
            "version",
            Map.of("major", 1, "minor", 0, "patch", 0),
            "releaseNotes",
            "Should fail",
            "issueIds",
            List.of());

    mockMvc
        .perform(
            post("/api/projects/" + UUID.randomUUID() + "/releases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void createRelease_success_creates_release() throws Exception {
    // register user
    AuthResponse auth = register("releaseowner@example.com", "password123", "ReleaseOwner");

    // create project
    var projectBody =
        Map.of(
            "name",
            "Project For Release",
            "description",
            "Project desc",
            "user",
            Map.of("id", auth.getId(), "email", auth.getEmail()));

    var projectMvc =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + auth.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andReturn();

    String projectContent = projectMvc.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> projectMap = objectMapper.readValue(projectContent, Map.class);
    String projectId = projectMap.get("id").toString();

    // create release
    var releaseBody =
        Map.of(
            "version",
            Map.of("major", 1, "minor", 0, "patch", 0),
            "releaseNotes",
            "Initial release",
            "issueIds",
            List.of());

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/releases")
                .header("Authorization", "Bearer " + auth.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(releaseBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.releaseNotes").value("Initial release"))
        .andExpect(jsonPath("$.projectId").value(projectId))
        .andExpect(jsonPath("$.creatorId").isNumber())
        .andExpect(jsonPath("$.issueIds").isArray());
  }

  @Test
  void getReleases_requires_auth() throws Exception {
    mockMvc
        .perform(get("/api/projects/" + UUID.randomUUID() + "/releases"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void getReleases_success_returns_list() throws Exception {
    // register user and create project + release
    com.group3.conduitedeprojet.dto.AuthResponse auth =
        register("releaseviewer@example.com", "password123", "ReleaseViewer");

    var projectBody =
        Map.of(
            "name",
            "Project For Get Releases",
            "description",
            "desc",
            "user",
            Map.of("id", auth.getId(), "email", auth.getEmail()));

    var projectMvc =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + auth.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

    String projectContent = projectMvc.getResponse().getContentAsString();
    @SuppressWarnings("unchecked")
    Map<String, Object> projectMap = objectMapper.readValue(projectContent, Map.class);
    String projectId = projectMap.get("id").toString();

    var releaseBody =
        Map.of(
            "version",
            Map.of("major", 2, "minor", 1, "patch", 0),
            "releaseNotes",
            "Release for listing",
            "issueIds",
            List.of());

    mockMvc
        .perform(
            post("/api/projects/" + projectId + "/releases")
                .header("Authorization", "Bearer " + auth.getToken())
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(releaseBody)))
        .andExpect(status().isOk());

    mockMvc
        .perform(
            get("/api/projects/" + projectId + "/releases")
                .header("Authorization", "Bearer " + auth.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].releaseNotes").value("Release for listing"))
        .andExpect(jsonPath("$[0].creatorId").isNumber())
        .andExpect(jsonPath("$[0].projectId").value(projectId));
  }
}
