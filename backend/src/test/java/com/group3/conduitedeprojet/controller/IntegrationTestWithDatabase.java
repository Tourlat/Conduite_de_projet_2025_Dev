package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.group3.conduitedeprojet.dto.AuthResponse;
import com.group3.conduitedeprojet.dto.CreateIssueRequest;
import com.group3.conduitedeprojet.dto.CreateProjectRequest;
import com.group3.conduitedeprojet.dto.IssueDto;
import com.group3.conduitedeprojet.dto.RegisterRequest;
import com.group3.conduitedeprojet.dto.UserDto;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Project;
import java.util.UUID;
import org.junit.jupiter.api.AfterAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public abstract class IntegrationTestWithDatabase {

  @Container
  static PostgreSQLContainer<?> postgres =
      new PostgreSQLContainer<>("postgres:17-alpine")
          .withDatabaseName("conduitedeprojet_db")
          .withUsername("admin")
          .withPassword("admin");

  @DynamicPropertySource
  static void registerPgProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
    registry.add("security.jwt.secret-key", () -> "5St66hi6E8M7oRbgHLpZT/VZgErpyKQXZMhUtAfHr6Y=");
    registry.add("security.jwt.expiration-ms", () -> "3600000");
  }

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper objectMapper;

  @AfterAll
  static void tearDown() {
    if (postgres != null && postgres.isRunning()) {
      postgres.stop();
    }
  }

  AuthResponse register(String email, String password, String name) throws Exception {
    var req = new RegisterRequest(email, password, name);
    var mvcRes =
        mockMvc
            .perform(
                post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(req)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value(email))
            .andExpect(jsonPath("$.name").value(name))
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andReturn();
    String content = mvcRes.getResponse().getContentAsString();
    return objectMapper.readValue(content, AuthResponse.class);
  }

  Project createProject(AuthResponse owner, String name, String description) throws Exception {
    CreateProjectRequest request =
        CreateProjectRequest.builder()
            .name(name)
            .description(description)
            .user(UserDto.builder().email(owner.getEmail()).id(owner.getId()).build())
            .build();

    MvcResult response =
        mockMvc
            .perform(
                post("/api/projects")
                    .header("Authorization", "Bearer " + owner.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andReturn();

    return objectMapper.readValue(response.getResponse().getContentAsString(), Project.class);
  }

  IssueDto createIssue(
      UUID projectId,
      AuthResponse authResponse,
      String title,
      String description,
      Issue.Priority priority,
      Integer storyPoints,
      Issue.Status status)
      throws Exception {
    var createIssueRequest =
        CreateIssueRequest.builder()
            .title(title)
            .description(description)
            .storyPoints(storyPoints)
            .priority(priority)
            .status(status);

    var response =
        mockMvc
            .perform(
                post("/api/projects/" + projectId + "/issues")
                    .header("Authorization", "Bearer " + authResponse.getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createIssueRequest)))
            .andExpect(status().isOk())
            .andReturn();

    return objectMapper.readValue(response.getResponse().getContentAsString(), IssueDto.class);
  }
}
