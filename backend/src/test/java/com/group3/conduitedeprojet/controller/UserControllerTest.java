package com.group3.conduitedeprojet.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.group3.conduitedeprojet.dto.LoginRequest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

public class UserControllerTest extends IntegrationTestWithDatabase {

  @Test
  void updateUser_success_and_forbidden_with_other_user_token() throws Exception {
    var authA = register("dave@example.com", "password123", "Dave");
    var updateBody = Map.of("email", "dave@example.com", "name", "David");

    mockMvc
        .perform(
            put("/api/users/")
                .header("Authorization", "Bearer " + authA.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("dave@example.com"))
        .andExpect(jsonPath("$.name").value("David"));

    var authB = register("mallory@example.com", "password123", "Mallory");
    mockMvc
        .perform(
            put("/api/users/")
                .header("Authorization", "Bearer " + authB.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateBody)))
        .andExpect(status().isForbidden());
  }

  @Test
  void changePassword_requires_auth_and_allows_password_change() throws Exception {
    var auth = register("eve@example.com", "password123", "Eve");

    var changeReq = Map.of("currentPassword", "password123", "newPassword", "newpass123");

    mockMvc
        .perform(
            put("/api/users/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(changeReq)))
        .andExpect(status().isUnauthorized());

    mockMvc
        .perform(
            put("/api/users/password")
                .header("Authorization", "Bearer " + auth.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(changeReq)))
        .andExpect(status().isNoContent());

    // login with new password -> ok
    var loginOk = new LoginRequest("eve@example.com", "newpass123");
    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginOk)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("eve@example.com"))
        .andExpect(jsonPath("$.name").value("Eve"))
        .andExpect(jsonPath("$.token").isNotEmpty());

    var loginBad = new LoginRequest("eve@example.com", "password123");
    mockMvc
        .perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginBad)))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.error").value("INVALID_CREDENTIALS"));
  }
}
