package com.group3.conduitedeprojet.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
public class AuthControllerTest {

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

  @Test
  public void register_shouldReturnAuthResponse() throws Exception {
    var req = new com.group3.conduitedeprojet.dto.RegisterRequest("alice@example.com",
        "password123", "Alice");

    mockMvc
        .perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("alice@example.com"))
        .andExpect(jsonPath("$.name").value("Alice")).andExpect(jsonPath("$.token").isNotEmpty());
  }

  @Test
  public void register_duplicateEmail_shouldReturnConflict() throws Exception {
    var req = new com.group3.conduitedeprojet.dto.RegisterRequest("bob@example.com", "password123",
        "Bob");

    mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(req))).andExpect(status().isOk());

    mockMvc
        .perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.error").value("EMAIL_ALREADY_EXISTS"));
  }

  @Test
  public void login_shouldReturnAuthResponse_and_wrongPassword_returnsUnauthorized()
      throws Exception {
    var registerReq = new com.group3.conduitedeprojet.dto.RegisterRequest("carol@example.com",
        "password123", "Carol");

    mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(registerReq))).andExpect(status().isOk());

    var loginReq =
        new com.group3.conduitedeprojet.dto.LoginRequest("carol@example.com", "password123");

    mockMvc
        .perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(loginReq)))
        .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("carol@example.com"))
        .andExpect(jsonPath("$.name").value("Carol")).andExpect(jsonPath("$.token").isNotEmpty());

    var badLogin =
        new com.group3.conduitedeprojet.dto.LoginRequest("carol@example.com", "wrongpass");
    mockMvc
        .perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(badLogin)))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"));
  }
}
