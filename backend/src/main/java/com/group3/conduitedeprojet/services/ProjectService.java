package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.dto.*;
import com.group3.conduitedeprojet.exceptions.UserNotFoundException;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.ProjectRepository;
import com.group3.conduitedeprojet.repositories.UserRepository;
import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {

  @Autowired private ProjectRepository projectRepository;

  @Autowired private UserRepository userRepository;

  @Autowired private EntityLookupService entityLookupService;

  public Project createProject(CreateProjectRequest createProjectRequest) {
    User creator = entityLookupService.getUser(createProjectRequest.getUser().getId());

    Project project =
        Project.builder()
            .name(createProjectRequest.getName())
            .description(createProjectRequest.getDescription())
            .creator(creator)
            .build();

    Set<User> collaborators = new HashSet<>();

    if (createProjectRequest.getCollaborateurs() != null
        && !createProjectRequest.getCollaborateurs().isEmpty()) {

      for (String email : createProjectRequest.getCollaborateurs()) {
        Optional<User> collaborator = userRepository.findByEmail(email);
        if (collaborator.isPresent()) {
          collaborators.add(collaborator.get());
        }
      }
    }

    collaborators.add(creator);
    project.setCollaborators(collaborators);

    return projectRepository.save(project);
  }

  public List<ProjectDto> findProjectsByUser(String email) {
    User user = entityLookupService.getUserByEmail(email);

    List<Project> projects = projectRepository.findAllByUserParticipation(user);

    return projects.stream().map(Project::toProjectDto).toList();
  }

  public List<UserDto> getProjectCollaborators(UUID projectId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);

    return project.getCollaborators().stream().map(User::convertToUserDto).toList();
  }

  public List<UserDto> addCollaboratorsToProject(
      UUID projectId, AddCollaboratorsRequest addCollaboratorsRequest, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreator(project, principal);

    Set<User> newCollaborators =
        addCollaboratorsRequest.getCollaborators().stream()
            .map(
                collaboratorEmail -> {
                  Optional<User> user = userRepository.findByEmail(collaboratorEmail);
                  if (user.isEmpty()) {
                    throw new UserNotFoundException(
                        "User with email " + collaboratorEmail + " was not found");
                  }
                  return user.get();
                })
            .collect(Collectors.toSet());

    project.getCollaborators().addAll(newCollaborators);

    projectRepository.save(project);

    return project.getCollaborators().stream().map(User::convertToUserDto).toList();
  }

  public List<UserDto> removeCollaboratorFromProject(
      UUID projectId, Long collaboratorId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreator(project, principal);

    project.getCollaborators().remove(entityLookupService.getUser(collaboratorId));
    projectRepository.save(project);

    return project.getCollaborators().stream().map(User::convertToUserDto).toList();
  }

  public ProjectDto updateProject(
      UUID projectId, UpdateProjectRequest updateProjectRequest, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreator(project, principal);

    if (updateProjectRequest.getName() != null
        && !updateProjectRequest.getName().trim().isEmpty()) {
      project.setName(updateProjectRequest.getName().trim());
    }

    if (updateProjectRequest.getDescription() != null) {
      project.setDescription(updateProjectRequest.getDescription().trim());
    }

    projectRepository.save(project);

    return project.toProjectDto();
  }
}
