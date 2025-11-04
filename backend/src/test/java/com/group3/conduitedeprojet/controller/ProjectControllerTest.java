package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

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

        mockMvc.perform(
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

        mockMvc.perform(
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
}
