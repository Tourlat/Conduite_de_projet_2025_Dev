package com.group3.conduitedeprojet.services;

import java.security.Principal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import com.group3.conduitedeprojet.dto.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.group3.conduitedeprojet.exceptions.IssueNotFoundException;
import com.group3.conduitedeprojet.exceptions.NotAuthorizedException;
import com.group3.conduitedeprojet.exceptions.ProjectNotFoundException;
import com.group3.conduitedeprojet.exceptions.UserNotFoundException;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Issue.IssueBuilder;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.IssueRepository;
import com.group3.conduitedeprojet.repositories.ProjectRepository;
import com.group3.conduitedeprojet.repositories.UserRepository;

@Service
public class ProjectService {

  @Autowired
  private ProjectRepository projectRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private IssueRepository issueRepository;

  public Project createProject(CreateProjectRequest createProjectRequest) {
    Optional<User> creator = userRepository.findById(createProjectRequest.getUser().getId());
    if (!creator.isPresent()) {
      throw new UserNotFoundException("User with given id was not found");
    }

    // Créer le projet
    Project project = Project.builder().name(createProjectRequest.getName())
        .description(createProjectRequest.getDescription()).creator(creator.get()).build();

    // Ajouter les collaborateurs si présents
    if (createProjectRequest.getCollaborateurs() != null
        && !createProjectRequest.getCollaborateurs().isEmpty()) {
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

    return projects.stream().map(this::convertToDto).toList();
  }

  public List<UserDto> getProjectCollaborators(UUID projectId, Principal principal) {
    Optional<Project> optionalProject = projectRepository.findById(projectId);
    if (optionalProject.isEmpty()) {
      throw new ProjectNotFoundException("Project with id " + projectId + " was not found");
    }

    Project project = optionalProject.get();

    // Vérifier que l'utilisateur a accès au projet (créateur ou collaborateur)
    String userEmail = principal.getName();
    boolean hasAccess = project.getCreator().getEmail().equals(userEmail)
        || project.getCollaborators().stream().anyMatch(u -> u.getEmail().equals(userEmail));

    if (!hasAccess) {
      throw new NotAuthorizedException("You don't have access to this project");
    }

    return project.getCollaborators().stream().map(User::convertToUserDto).toList();
  }

  public List<UserDto> addCollaboratorsToProject(UUID projectId,
      AddCollaboratorsRequest addCollaboratorsRequest, Principal principal) {
    Project project = getProject(projectId);
    checkPrincipalIsCreator(project, principal);

    Set<User> newCollaborators =
        addCollaboratorsRequest.getCollaborators().stream().map(collaboratorEmail -> {
          Optional<User> user = userRepository.findByEmail(collaboratorEmail);
          if (user.isEmpty()) {
            throw new UserNotFoundException(
                "User with email " + collaboratorEmail + " was not found");
          }
          return user.get();
        }).collect(Collectors.toSet());

    project.getCollaborators().addAll(newCollaborators);

    projectRepository.save(project);

    return project.getCollaborators().stream().map(User::convertToUserDto).toList();
  }

  public List<UserDto> removeCollaboratorFromProject(UUID projectId, Long collaboratorId,
      Principal principal) {
    Project project = getProject(projectId);
    checkPrincipalIsCreator(project, principal);

    Optional<User> optionalUser = userRepository.findById(collaboratorId);
    if (optionalUser.isEmpty()) {
      throw new UserNotFoundException("User with id " + collaboratorId + " was not found");
    }
    User user = optionalUser.get();
    project.getCollaborators().remove(user);
    projectRepository.save(project);

    return project.getCollaborators().stream().map(User::convertToUserDto).toList();
  }

  public IssueDto createIssue(UUID projectId, CreateIssueRequest createIssueRequest,
      Principal principal) {
    Project project = getProject(projectId);
    checkPrincipalIsCreatorOrCollaborator(project, principal);

    IssueBuilder issueBuilder = Issue.builder().title(createIssueRequest.getTitle())
        .description(createIssueRequest.getDescription())
        .storyPoints(createIssueRequest.getStoryPoints()).project(project)
        .priority(createIssueRequest.getPriority())
        .status(createIssueRequest.getStatus());

    Optional<User> creator = userRepository.findByEmail(principal.getName());
    if (creator.isEmpty()) {
      throw new UserNotFoundException("Creator was not found");
    }

    issueBuilder.creator(creator.get());

    if (createIssueRequest.getAssigneeId() != null) {
      Long assigneeId = createIssueRequest.getAssigneeId();
      Optional<User> user = userRepository.findById(assigneeId);
      if (user.isEmpty()) {
        throw new UserNotFoundException("Assignee with id " + assigneeId + " not found");
      }
      issueBuilder.assignee(user.get());
    }

    Issue issue = issueBuilder.build();
    issueRepository.save(issue);
    return issue.toIssueDto();
  }

  public List<IssueDto> getIssuesByProject(UUID projectId, Principal principal) {
    Optional<Project> optionalProject = projectRepository.findById(projectId);
    if (optionalProject.isEmpty()) {
        throw new ProjectNotFoundException("Project with id " + projectId + " was not found");
    }

    Project project = optionalProject.get();

    String userEmail = principal.getName();
    boolean hasAccess = project.getCreator().getEmail().equals(userEmail)
        || project.getCollaborators().stream().anyMatch(u -> u.getEmail().equals(userEmail));

    if (!hasAccess) {
        throw new NotAuthorizedException("You don't have access to this project");
    }

    return issueRepository.findByProjectId(projectId).stream()
        .map(Issue::toIssueDto)
        .toList();
  }

  public void deleteIssue(UUID projectId, Long issueId, Principal principal) {
    Project project = getProject(projectId);
    checkPrincipalIsCreatorOrCollaborator(project, principal);

    Optional<Issue> optionalIssue = issueRepository.findByIdAndProjectId(issueId, projectId);
    if (optionalIssue.isEmpty()) {
      throw new IssueNotFoundException(
          "Issue with id " + issueId + " was not found in project " + projectId);
    }

    issueRepository.delete(optionalIssue.get());
  }

  public IssueDto updateIssue(UUID projectId, Long issueId, UpdateIssueRequest updateIssueRequest,
      Principal principal) {
    Project project = getProject(projectId);
    checkPrincipalIsCreatorOrCollaborator(project, principal);

    Optional<Issue> optionalIssue = issueRepository.findByIdAndProjectId(issueId, projectId);
    if (optionalIssue.isEmpty()) {
      throw new IssueNotFoundException(
          "Issue with id " + issueId + " was not found in project " + projectId);
    }

    Issue issue = optionalIssue.get();

    if (updateIssueRequest.getTitle() != null) {
      issue.setTitle(updateIssueRequest.getTitle());
    }
    if (updateIssueRequest.getDescription() != null) {
      issue.setDescription(updateIssueRequest.getDescription());
    }
    if (updateIssueRequest.getPriority() != null) {
      issue.setPriority(updateIssueRequest.getPriority());
    }
    if (updateIssueRequest.getStoryPoints() != null) {
      issue.setStoryPoints(updateIssueRequest.getStoryPoints());
    }
    if (updateIssueRequest.getStatus() != null) {
      issue.setStatus(updateIssueRequest.getStatus());
    }
    if (updateIssueRequest.getAssigneeId() != null) {
      Long assigneeId = updateIssueRequest.getAssigneeId();
      Optional<User> user = userRepository.findById(assigneeId);
      if (user.isEmpty()) {
        throw new UserNotFoundException("Assignee with id " + assigneeId + " not found");
      }
      issue.setAssignee(user.get());
    }

    issueRepository.save(issue);
    return issue.toIssueDto();
  }

  public ProjectResponse updateProject(UUID projectId, UpdateProjectRequest updateProjectRequest,
      Principal principal) {
    Project project = getProject(projectId);
    checkPrincipalIsCreator(project, principal);

    if (updateProjectRequest.getName() != null
        && !updateProjectRequest.getName().trim().isEmpty()) {
      project.setName(updateProjectRequest.getName().trim());
    }

    if (updateProjectRequest.getDescription() != null) {
      project.setDescription(updateProjectRequest.getDescription().trim());
    }

    projectRepository.save(project);

    return convertToDto(project);
  }

  private ProjectResponse convertToDto(Project project) {
    User creator = project.getCreator();

    ProjectResponse.CreatorDto creatorDto = ProjectResponse.CreatorDto.builder().id(creator.getId())
        .email(creator.getEmail()).name(creator.getName()).build();

    return ProjectResponse.builder().id(project.getId()).name(project.getName())
        .description(project.getDescription()).createdAt(project.getCreatedAt()).creator(creatorDto)
        .build();
  }

  private Project getProject(UUID projectId) {
    Optional<Project> optionalProject = projectRepository.findById(projectId);
    if (optionalProject.isEmpty()) {
      throw new ProjectNotFoundException("Project with id " + projectId + " was not found");
    }
    return optionalProject.get();
  }

  private void checkPrincipalIsCreator(Project project, Principal principal) {
    if (!project.getCreator().getUsername().equals(principal.getName())) {
      throw new NotAuthorizedException("Only the project creator can make changes");
    }
  }

  private void checkPrincipalIsCreatorOrCollaborator(Project project, Principal principal) {
    boolean principalIsCollaborator = project.getCollaborators().stream().map(User::getEmail)
        .anyMatch(collaboratorEmail -> collaboratorEmail.equals(principal.getName()));

    if (!project.getCreator().getUsername().equals(principal.getName())
        && !principalIsCollaborator) {
      throw new NotAuthorizedException("Only a collaborator or creator can make change");
    }
  }
}
