package com.group3.conduitedeprojet.controller;

import java.security.Principal;
import java.util.Optional;

import com.group3.conduitedeprojet.dto.CreateProjectRequest;
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
}
