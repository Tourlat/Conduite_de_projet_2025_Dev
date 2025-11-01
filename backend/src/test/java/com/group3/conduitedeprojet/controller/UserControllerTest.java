package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.group3.conduitedeprojet.dto.AuthResponse;
import com.group3.conduitedeprojet.dto.LoginRequest;
import com.group3.conduitedeprojet.dto.RegisterRequest;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class UserControllerTest {

  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine")
      .withDatabaseName("conduitedeprojet_db").withUsername("admin").withPassword("admin");

  @DynamicPropertySource
  static void registerPgProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
    registry.add("security.jwt.secret-key", () -> "5St66hi6E8M7oRbgHLpZT/VZgErpyKQXZMhUtAfHr6Y=");
    registry.add("security.jwt.expiration-ms", () -> "3600000");
  }

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {}

  @AfterAll
  static void tearDown() {
    if (postgres != null && postgres.isRunning()) {
      postgres.stop();
    }
  }

  private AuthResponse register(String email, String password, String name) throws Exception {
    var req = new RegisterRequest(email, password, name);
    var mvcRes = mockMvc
        .perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email))
        .andExpect(jsonPath("$.name").value(name)).andExpect(jsonPath("$.token").isNotEmpty())
        .andReturn();
    String content = mvcRes.getResponse().getContentAsString();
    return objectMapper.readValue(content, AuthResponse.class);
  }

  @Test
  public void updateUser_success_and_forbidden_with_other_user_token() throws Exception {
    var authA = register("dave@example.com", "password123", "Dave");
    var updateBody = Map.of("email", "dave@example.com", "name", "David");

    mockMvc
        .perform(put("/api/users/").header("Authorization", "Bearer " + authA.getToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("dave@example.com"))
        .andExpect(jsonPath("$.name").value("David"));

    var authB = register("mallory@example.com", "password123", "Mallory");
    mockMvc
        .perform(put("/api/users/").header("Authorization", "Bearer " + authB.getToken())
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isForbidden());
  }

  @Test
  public void changePassword_requires_auth_and_allows_password_change() throws Exception {
    var auth = register("eve@example.com", "password123", "Eve");

    var changeReq = Map.of("currentPassword", "password123", "newPassword", "newpass123");

    mockMvc.perform(put("/api/users/password").contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(changeReq))).andExpect(status().isForbidden());

    mockMvc.perform(put("/api/users/password").header("Authorization", "Bearer " + auth.getToken())
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(changeReq))).andExpect(status().isNoContent());

    // login with new password -> ok
    var loginOk = new LoginRequest("eve@example.com", "newpass123");
    mockMvc
        .perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginOk)))
        .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("eve@example.com"))
        .andExpect(jsonPath("$.name").value("Eve")).andExpect(jsonPath("$.token").isNotEmpty());

    var loginBad = new LoginRequest("eve@example.com", "password123");
    mockMvc
        .perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginBad)))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"));
  }
}
