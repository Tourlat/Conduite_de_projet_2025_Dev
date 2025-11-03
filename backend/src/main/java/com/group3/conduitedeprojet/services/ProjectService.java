package com.group3.conduitedeprojet.services;

import java.util.Optional;

import com.group3.conduitedeprojet.dto.CreateProjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.group3.conduitedeprojet.exceptions.UserNotFoundException;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.ProjectRepository;
import com.group3.conduitedeprojet.repositories.UserRepository;

@Service
public class ProjectService {

    @Autowired private ProjectRepository projectRepository;

    @Autowired private UserRepository userRepository;

    public Project createProject(CreateProjectRequest createProjectRequest) {
        Optional<User> creator = userRepository.findById(createProjectRequest.getUser().getId());
        if (!creator.isPresent()) {
            throw new UserNotFoundException("User with given id was not found");
        }

        Project project =
                Project.builder()
                        .name(createProjectRequest.getName())
                        .description(createProjectRequest.getDescription().orElse(null))
                        .creator(creator.get())
                        .build();
        return projectRepository.save(project);
    }
}
