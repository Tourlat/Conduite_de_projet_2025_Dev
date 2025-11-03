package com.group3.conduitedeprojet.services;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.group3.conduitedeprojet.dto.CreateProjectRequest;
import com.group3.conduitedeprojet.dto.ProjectResponse;
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

        // Créer le projet
        Project project =
                Project.builder()
                        .name(createProjectRequest.getName())
                        .description(createProjectRequest.getDescription())
                        .creator(creator.get())
                        .build();

        // Ajouter les collaborateurs si présents
        if (createProjectRequest.getCollaborateurs() != null && !createProjectRequest.getCollaborateurs().isEmpty()) {
            Set<User> collaborators = new HashSet<>();
            for (String email : createProjectRequest.getCollaborateurs()) {
                Optional<User> collaborator = userRepository.findByEmail(email);
                if (collaborator.isPresent()) {
                    collaborators.add(collaborator.get());
                }
            }
            project.setCollaborators(collaborators);
        }

        return projectRepository.save(project);
    }

    public List<ProjectResponse> findProjectsByUser(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (!user.isPresent()) {
            throw new UserNotFoundException("User with email " + email + " was not found");
        }
        
        List<Project> projects = projectRepository.findAllByUserParticipation(user.get());
        
        return projects.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProjectResponse convertToDto(Project project) {
        User creator = project.getCreator();
        
        ProjectResponse.CreatorDto creatorDto = ProjectResponse.CreatorDto.builder()
                .id(creator.getId())
                .email(creator.getEmail())
                .name(creator.getName())
                .build();
        
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .createdAt(project.getCreatedAt())
                .creator(creatorDto)
                .build();
    }
}
