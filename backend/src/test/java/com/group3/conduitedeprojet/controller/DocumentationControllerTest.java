package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

public class DocumentationControllerTest extends IntegrationTestWithDatabase {

    @Test
    void getDocumentation_requires_auth() throws Exception {
        UUID projectId = UUID.randomUUID();

        mockMvc
            .perform(get("/api/projects/" + projectId + "/docs"))
            .andExpect(status().isForbidden());
    }

    @Test
    void createDocumentation_requires_auth() throws Exception {
        UUID projectId = UUID.randomUUID();
        var body = Map.of(
            "title", "Test Doc",
            "content", "# Test Content"
        );

        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/docs")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isForbidden());
    }

    @Test
    void createDocumentation_success() throws Exception {
        var owner = register("docowner@example.com", "password123", "DocOwner");

        // Create a project first
        var projectBody = Map.of(
            "name", "Project with Docs",
            "description", "Test project",
            "user", Map.of("id", owner.getId(), "email", owner.getEmail())
        );

        var projectResponse = mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

        var projectJson = objectMapper.readTree(projectResponse.getResponse().getContentAsString());
        String projectId = projectJson.get("id").asText();

        // Create documentation
        var docBody = Map.of(
            "title", "Getting Started",
            "content", "# Welcome\n\nThis is the documentation."
        );

        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(docBody)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").isNotEmpty())
            .andExpect(jsonPath("$.title").value("Getting Started"))
            .andExpect(jsonPath("$.content").value("# Welcome\n\nThis is the documentation."))
            .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    void getDocumentation_success() throws Exception {
        var owner = register("docreader@example.com", "password123", "DocReader");

        // Create project
        var projectBody = Map.of(
            "name", "Project for Reading Docs",
            "description", "Test project",
            "user", Map.of("id", owner.getId(), "email", owner.getEmail())
        );

        var projectResponse = mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

        var projectJson = objectMapper.readTree(projectResponse.getResponse().getContentAsString());
        String projectId = projectJson.get("id").asText();

        // Create two docs
        var doc1 = Map.of("title", "Doc 1", "content", "Content 1");
        var doc2 = Map.of("title", "Doc 2", "content", "Content 2");

        mockMvc.perform(
            post("/api/projects/" + projectId + "/docs")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(doc1)))
            .andExpect(status().isOk());

        mockMvc.perform(
            post("/api/projects/" + projectId + "/docs")
                .header("Authorization", "Bearer " + owner.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(doc2)))
            .andExpect(status().isOk());

        // Get all docs
        mockMvc
            .perform(
                get("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].title").exists())
            .andExpect(jsonPath("$[1].title").exists());
    }

    @Test
    void updateDocumentation_success() throws Exception {
        var owner = register("docupdater@example.com", "password123", "DocUpdater");

        // Create project
        var projectBody = Map.of(
            "name", "Project for Updating Docs",
            "description", "Test project",
            "user", Map.of("id", owner.getId(), "email", owner.getEmail())
        );

        var projectResponse = mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

        var projectJson = objectMapper.readTree(projectResponse.getResponse().getContentAsString());
        String projectId = projectJson.get("id").asText();

        // Create doc
        var docBody = Map.of("title", "Original Title", "content", "Original content");

        var docResponse = mockMvc
            .perform(
                post("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(docBody)))
            .andExpect(status().isOk())
            .andReturn();

        var docJson = objectMapper.readTree(docResponse.getResponse().getContentAsString());
        Long docId = docJson.get("id").asLong();

        // Update doc
        var updateBody = Map.of("title", "Updated Title", "content", "Updated content");

        mockMvc
            .perform(
                put("/api/projects/" + projectId + "/docs/" + docId)
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateBody)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(docId))
            .andExpect(jsonPath("$.title").value("Updated Title"))
            .andExpect(jsonPath("$.content").value("Updated content"))
            .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    void deleteDocumentation_success() throws Exception {
        var owner = register("docdeleter@example.com", "password123", "DocDeleter");

        // Create project
        var projectBody = Map.of(
            "name", "Project for Deleting Docs",
            "description", "Test project",
            "user", Map.of("id", owner.getId(), "email", owner.getEmail())
        );

        var projectResponse = mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(projectBody)))
            .andExpect(status().isOk())
            .andReturn();

        var projectJson = objectMapper.readTree(projectResponse.getResponse().getContentAsString());
        String projectId = projectJson.get("id").asText();

        // Create doc
        var docBody = Map.of("title", "To Delete", "content", "Will be deleted");

        var docResponse = mockMvc
            .perform(
                post("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(docBody)))
            .andExpect(status().isOk())
            .andReturn();

        var docJson = objectMapper.readTree(docResponse.getResponse().getContentAsString());
        Long docId = docJson.get("id").asLong();

        // Delete doc
        mockMvc
            .perform(
                delete("/api/projects/" + projectId + "/docs/" + docId)
                    .header("Authorization", "Bearer " + owner.getToken()))
            .andExpect(status().isNoContent());

        // Verify it's deleted
        mockMvc
            .perform(
                get("/api/projects/" + projectId + "/docs")
                    .header("Authorization", "Bearer " + owner.getToken()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void updateDocumentation_requires_auth() throws Exception {
        UUID projectId = UUID.randomUUID();
        Long docId = 1L;
        var body = Map.of("title", "Updated", "content", "Updated content");

        mockMvc
            .perform(
                put("/api/projects/" + projectId + "/docs/" + docId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(body)))
            .andExpect(status().isForbidden());
    }

    @Test
    void deleteDocumentation_requires_auth() throws Exception {
        UUID projectId = UUID.randomUUID();
        Long docId = 1L;

        mockMvc
            .perform(delete("/api/projects/" + projectId + "/docs/" + docId))
            .andExpect(status().isForbidden());
    }
}
