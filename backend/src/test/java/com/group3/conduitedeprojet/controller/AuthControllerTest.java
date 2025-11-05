package com.group3.conduitedeprojet.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class AuthControllerTest extends IntegrationTestWithDatabase {

  @Test
  public void testRegisterShouldReturnAuthResponse() throws Exception {
    var req = new com.group3.conduitedeprojet.dto.RegisterRequest("alice@example.com",
        "password123", "Alice");

    mockMvc
        .perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(req)))
        .andExpect(status().isOk()).andExpect(jsonPath("$.email").value("alice@example.com"))
        .andExpect(jsonPath("$.name").value("Alice")).andExpect(jsonPath("$.token").isNotEmpty());
  }

  @Test
  public void testRegisterWithDuplicateEmailShouldReturnConflict() throws Exception {
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
  public void testWrongPasswordReturnsUnauthorized() throws Exception {
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
