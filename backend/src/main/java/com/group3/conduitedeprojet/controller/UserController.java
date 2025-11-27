package com.group3.conduitedeprojet.controller;

import com.group3.conduitedeprojet.dto.ChangePasswordRequest;
import com.group3.conduitedeprojet.dto.ChangeUserRequest;
import com.group3.conduitedeprojet.dto.UserDto;
import com.group3.conduitedeprojet.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.security.Principal;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

  @Autowired UserService userService;

  @Operation(summary = "Get all users", description = "Retrieves a list of all users in the system")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Users successfully retrieved",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @GetMapping
  public ResponseEntity<List<UserDto>> getAllUsers() {
    return ResponseEntity.ok(userService.findAllUsers());
  }

  @Operation(summary = "Get a user by ID", description = "Retrieves a specific user by their ID")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "User successfully retrieved",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "User not found (UserNotFoundException)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @GetMapping("/{id}")
  public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userService.findUser(id));
  }

  @Operation(
      summary = "Update user information",
      description =
          "Updates the authenticated user's information (users can only update their own data)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "User successfully updated",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content),
        @ApiResponse(
            responseCode = "401",
            description = "Unauthorized - authentication required",
            content = @Content),
        @ApiResponse(
            responseCode = "403",
            description = "Forbidden - can only update own user data",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "User not found (UserNotFoundException)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @PutMapping("/")
  public ResponseEntity<UserDto> updateUser(
      @RequestBody ChangeUserRequest user, Principal principal) {
    if (principal == null || !principal.getName().equals(user.getEmail())) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    UserDto updated = userService.updateUser(user);
    return ResponseEntity.ok(updated);
  }

  @Operation(
      summary = "Change user password",
      description = "Changes the authenticated user's password")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Password successfully changed"),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content),
        @ApiResponse(
            responseCode = "401",
            description =
                "Unauthorized - authentication required or invalid current password (InvalidCredentialsException)",
            content = @Content),
        @ApiResponse(
            responseCode = "404",
            description = "User not found (UserNotFoundException)",
            content = @Content),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error",
            content = @Content)
      })
  @PutMapping("/password")
  public ResponseEntity<Void> changePassword(
      @RequestBody ChangePasswordRequest req, Principal principal) {
    if (principal == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    userService.changePassword(principal.getName(), req.getCurrentPassword(), req.getNewPassword());
    return ResponseEntity.noContent().build();
  }
}
