package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

public class DocumentationIssueControllerTest extends IntegrationTestWithDatabase {

  @Test
  void linkDocumentationToIssue_success() throws Exception {
    var owner = register("linktest@example.com", "password123", "LinkTester");

    var projectBody =
        Map.of(
            "name", "Project with Links",
            "description", "Test project",
            "user", Map.of("id", owner.getId(), "email", owner.getEmail()));

    var projectResponse =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

    var projectJson = objectMapper.readTree(projectResponse.getResponse().getContentAsString());
    String projectId = projectJson.get("id").asText();

    var docBody = Map.of("title", "API Documentation", "content", "# API Guide");

    var docResponse =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(docBody)))
            .andExpect(status().isOk())
            .andReturn();

    var docJson = objectMapper.readTree(docResponse.getResponse().getContentAsString());
    Long docId = docJson.get("id").asLong();

    var issueBody =
        Map.of(
            "title",
            "Implement feature",
            "description",
            "Feature description",
            "priority",
            "HIGH",
            "storyPoints",
            5,
            "status",
            "TODO");

    var issueResponse =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issueBody)))
            .andExpect(status().isOk())
            .andReturn();

    var issueJson = objectMapper.readTree(issueResponse.getResponse().getContentAsString());
    Long issueId = issueJson.get("id").asLong();

    mockMvc
        .perform(
            post("/api/documentation-issues/documentation/" + docId + "/issue/" + issueId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.documentationId").value(docId))
        .andExpect(jsonPath("$.issueId").value(issueId))
        .andExpect(jsonPath("$.issueTitle").value("Implement feature"))
        .andExpect(jsonPath("$.issuePriority").value("HIGH"))
        .andExpect(jsonPath("$.issueStatus").value("TODO"));
  }

  @Test
  void getIssuesByDocumentation_success() throws Exception {
    var owner = register("getissues@example.com", "password123", "GetIssuesTester");

    var projectBody =
        Map.of(
            "name", "Project for Get Issues",
            "description", "Test project",
            "user", Map.of("id", owner.getId(), "email", owner.getEmail()));

    var projectResponse =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

    var projectJson = objectMapper.readTree(projectResponse.getResponse().getContentAsString());
    String projectId = projectJson.get("id").asText();

    var docBody = Map.of("title", "User Guide", "content", "# User Manual");

    var docResponse =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(docBody)))
            .andExpect(status().isOk())
            .andReturn();

    var docJson = objectMapper.readTree(docResponse.getResponse().getContentAsString());
    Long docId = docJson.get("id").asLong();

    var issue1Body =
        Map.of(
            "title",
            "Bug fix",
            "description",
            "Fix the bug",
            "priority",
            "HIGH",
            "storyPoints",
            3,
            "status",
            "TODO");

    var issue1Response =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issue1Body)))
            .andExpect(status().isOk())
            .andReturn();

    var issue1Json = objectMapper.readTree(issue1Response.getResponse().getContentAsString());
    Long issue1Id = issue1Json.get("id").asLong();

    var issue2Body =
        Map.of(
            "title",
            "Feature request",
            "description",
            "New feature",
            "priority",
            "MEDIUM",
            "storyPoints",
            5,
            "status",
            "TODO");

    var issue2Response =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issue2Body)))
            .andExpect(status().isOk())
            .andReturn();

    var issue2Json = objectMapper.readTree(issue2Response.getResponse().getContentAsString());
    Long issue2Id = issue2Json.get("id").asLong();

    mockMvc
        .perform(
            post("/api/documentation-issues/documentation/" + docId + "/issue/" + issue1Id)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            post("/api/documentation-issues/documentation/" + docId + "/issue/" + issue2Id)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            get("/api/documentation-issues/documentation/" + docId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(2))
        .andExpect(jsonPath("$[0].issueTitle").exists())
        .andExpect(jsonPath("$[1].issueTitle").exists());
  }

  @Test
  void unlinkDocumentationFromIssue_success() throws Exception {
    var owner = register("unlink@example.com", "password123", "UnlinkTester");

    var projectBody =
        Map.of(
            "name", "Project for Unlink",
            "description", "Test project",
            "user", Map.of("id", owner.getId(), "email", owner.getEmail()));

    var projectResponse =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

    var projectJson = objectMapper.readTree(projectResponse.getResponse().getContentAsString());
    String projectId = projectJson.get("id").asText();

    var docBody = Map.of("title", "Tech Specs", "content", "# Specifications");

    var docResponse =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(docBody)))
            .andExpect(status().isOk())
            .andReturn();

    var docJson = objectMapper.readTree(docResponse.getResponse().getContentAsString());
    Long docId = docJson.get("id").asLong();

    var issueBody =
        Map.of(
            "title",
            "Update docs",
            "description",
            "Update documentation",
            "priority",
            "LOW",
            "storyPoints",
            2,
            "status",
            "TODO");

    var issueResponse =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issueBody)))
            .andExpect(status().isOk())
            .andReturn();

    var issueJson = objectMapper.readTree(issueResponse.getResponse().getContentAsString());
    Long issueId = issueJson.get("id").asLong();

    mockMvc
        .perform(
            post("/api/documentation-issues/documentation/" + docId + "/issue/" + issueId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            delete("/api/documentation-issues/documentation/" + docId + "/issue/" + issueId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isNoContent());

    mockMvc
        .perform(
            get("/api/documentation-issues/documentation/" + docId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(0));
  }

  @Test
  void linkDocumentationToIssue_alreadyExists() throws Exception {
    var owner = register("duplicate@example.com", "password123", "DupTester");

    var projectBody =
        Map.of(
            "name", "Project for Duplicate Test",
            "description", "Test project",
            "user", Map.of("id", owner.getId(), "email", owner.getEmail()));

    var projectResponse =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

    var projectJson = objectMapper.readTree(projectResponse.getResponse().getContentAsString());
    String projectId = projectJson.get("id").asText();

    var docBody = Map.of("title", "README", "content", "# README");

    var docResponse =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(docBody)))
            .andExpect(status().isOk())
            .andReturn();

    var docJson = objectMapper.readTree(docResponse.getResponse().getContentAsString());
    Long docId = docJson.get("id").asLong();

    var issueBody =
        Map.of(
            "title",
            "Test issue",
            "description",
            "Test",
            "priority",
            "MEDIUM",
            "storyPoints",
            3,
            "status",
            "TODO");

    var issueResponse =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(issueBody)))
            .andExpect(status().isOk())
            .andReturn();

    var issueJson = objectMapper.readTree(issueResponse.getResponse().getContentAsString());
    Long issueId = issueJson.get("id").asLong();

    mockMvc
        .perform(
            post("/api/documentation-issues/documentation/" + docId + "/issue/" + issueId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().isCreated());

    mockMvc
        .perform(
            post("/api/documentation-issues/documentation/" + docId + "/issue/" + issueId)
                .header("Authorization", "Bearer " + owner.getToken()))
        .andExpect(status().is5xxServerError());
  }
}
