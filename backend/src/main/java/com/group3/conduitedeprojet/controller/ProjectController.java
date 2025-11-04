package com.group3.conduitedeprojet.controller;

import java.security.Principal;
import java.util.List;

import com.group3.conduitedeprojet.dto.CreateProjectRequest;
import com.group3.conduitedeprojet.dto.ProjectResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.services.ProjectService;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired private ProjectService projectService;

    @PostMapping
    public ResponseEntity<Project> createProject(
            @RequestBody CreateProjectRequest createProjectRequest, Principal principal) {
        if (principal == null
                || !createProjectRequest.getUser().getEmail().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(projectService.createProject(createProjectRequest));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(projectService.findProjectsByUser(principal.getName()));
    }
}
