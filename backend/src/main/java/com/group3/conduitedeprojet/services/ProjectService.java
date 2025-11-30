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

  public List<ProjectResponse> findProjectsByUser(String email) {
    User user = entityLookupService.getUserByEmail(email);

    List<Project> projects = projectRepository.findAllByUserParticipation(user);

    return projects.stream().map(this::convertToDto).toList();
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

  // public IssueDto createIssue(
  // UUID projectId, CreateIssueRequest createIssueRequest, Principal principal) {
  // Project project = entityLookupService.getProject(projectId);
  // entityLookupService.checkPrincipalIsCreatorOrCollaborator(project,
  // principal);

  // User creator = entityLookupService.getUserByEmail(principal.getName());

  // IssueBuilder issueBuilder =
  // Issue.builder()
  // .title(createIssueRequest.getTitle())
  // .description(createIssueRequest.getDescription())
  // .storyPoints(createIssueRequest.getStoryPoints())
  // .project(project)
  // .priority(createIssueRequest.getPriority())
  // .status(createIssueRequest.getStatus())
  // .creator(creator);

  // if (createIssueRequest.getAssigneeId() != null) {
  // issueBuilder.assignee(entityLookupService.getUser(createIssueRequest.getAssigneeId()));
  // }

  // Issue issue = issueBuilder.build();
  // issueRepository.save(issue);
  // return issue.toIssueDto();
  // }

  // public List<IssueDto> getIssuesByProject(UUID projectId, Principal principal)
  // {
  // Project project = entityLookupService.getProject(projectId);

  // String userEmail = principal.getName();
  // boolean hasAccess =
  // project.getCreator().getEmail().equals(userEmail)
  // || project.getCollaborators().stream().anyMatch(u ->
  // u.getEmail().equals(userEmail));

  // if (!hasAccess) {
  // throw new NotAuthorizedException("You don't have access to this project");
  // }

  // return
  // issueRepository.findByProjectId(projectId).stream().map(Issue::toIssueDto).toList();
  // }

  // public void deleteIssue(UUID projectId, Long issueId, Principal principal) {
  // Project project = entityLookupService.getProject(projectId);
  // entityLookupService.checkPrincipalIsCreatorOrCollaborator(project,
  // principal);

  // Optional<Issue> optionalIssue = issueRepository.findByIdAndProjectId(issueId,
  // projectId);
  // if (optionalIssue.isEmpty()) {
  // throw new IssueNotFoundException(
  // "Issue with id " + issueId + " was not found in project " + projectId);
  // }

  // issueRepository.delete(optionalIssue.get());
  // }

  // public IssueDto updateIssue(
  // UUID projectId, Long issueId, UpdateIssueRequest updateIssueRequest,
  // Principal principal) {
  // Project project = entityLookupService.getProject(projectId);
  // entityLookupService.checkPrincipalIsCreatorOrCollaborator(project,
  // principal);

  // Optional<Issue> optionalIssue = issueRepository.findByIdAndProjectId(issueId,
  // projectId);
  // if (optionalIssue.isEmpty()) {
  // throw new IssueNotFoundException(
  // "Issue with id " + issueId + " was not found in project " + projectId);
  // }

  // Issue issue = optionalIssue.get();

  // if (updateIssueRequest.getTitle() != null) {
  // issue.setTitle(updateIssueRequest.getTitle());
  // }
  // if (updateIssueRequest.getDescription() != null) {
  // issue.setDescription(updateIssueRequest.getDescription());
  // }
  // if (updateIssueRequest.getPriority() != null) {
  // issue.setPriority(updateIssueRequest.getPriority());
  // }
  // if (updateIssueRequest.getStoryPoints() != null) {
  // issue.setStoryPoints(updateIssueRequest.getStoryPoints());
  // }
  // if (updateIssueRequest.getStatus() != null) {
  // issue.setStatus(updateIssueRequest.getStatus());
  // }
  // if (updateIssueRequest.getAssigneeId() != null) {
  // Long assigneeId = updateIssueRequest.getAssigneeId();
  // Optional<User> user = userRepository.findById(assigneeId);
  // if (user.isEmpty()) {
  // throw new UserNotFoundException("Assignee with id " + assigneeId + " not
  // found");
  // }
  // issue.setAssignee(user.get());
  // }

  // issueRepository.save(issue);
  // return issue.toIssueDto();
  // }

  // public TaskDto createTask(
  // UUID projectId, Long issueId, CreateTaskRequest createTaskRequest, Principal
  // principal) {
  // Project project = entityLookupService.getProject(projectId);
  // entityLookupService.checkPrincipalIsCreatorOrCollaborator(project,
  // principal);
  // Issue issue = entityLookupService.getIssue(issueId);
  // User creator = entityLookupService.getUserByEmail(principal.getName());

  // Task.TaskBuilder taskBuilder =
  // Task.builder()
  // .creator(creator)
  // .description(createTaskRequest.getDescription())
  // .title(createTaskRequest.getTitle())
  // .project(project)
  // .issue(issue)
  // .definitionOfDone(createTaskRequest.getDefinitionOfDone());

  // if (createTaskRequest.getAssigneeId() != null) {
  // taskBuilder.assignee(entityLookupService.getUser(createTaskRequest.getAssigneeId()));
  // }

  // if (createTaskRequest.getStatus() == null) {
  // taskBuilder.status(Task.Status.TODO);
  // } else {
  // taskBuilder.status(createTaskRequest.getStatus());
  // }

  // Task task = taskBuilder.build();
  // taskRepository.save(task);
  // return task.toTaskDto();
  // }

  // public List<TaskDto> getTasksByIssue(UUID projectId, Long issueId, Principal
  // principal) {
  // Project project = entityLookupService.getProject(projectId);
  // entityLookupService.checkPrincipalIsCreatorOrCollaborator(project,
  // principal);
  // entityLookupService.getIssue(issueId);

  // List<Task> tasks = taskRepository.findByIssueId(issueId);
  // return tasks.stream().map(Task::toTaskDto).toList();
  // }

  // public TaskDto updateTask(
  // UUID projectId,
  // Long issueId,
  // Long taskId,
  // CreateTaskRequest updateTaskRequest,
  // Principal principal) {
  // Project project = entityLookupService.getProject(projectId);
  // entityLookupService.checkPrincipalIsCreatorOrCollaborator(project,
  // principal);
  // entityLookupService.getIssue(issueId);
  // Task task = entityLookupService.getTask(taskId);

  // if (updateTaskRequest.getTitle() != null &&
  // !updateTaskRequest.getTitle().trim().isEmpty()) {
  // task.setTitle(updateTaskRequest.getTitle().trim());
  // }

  // if (updateTaskRequest.getDescription() != null) {
  // task.setDescription(updateTaskRequest.getDescription().trim());
  // }

  // if (updateTaskRequest.getDefinitionOfDone() != null) {
  // task.setDefinitionOfDone(updateTaskRequest.getDefinitionOfDone().trim());
  // }

  // if (updateTaskRequest.getStatus() != null) {
  // task.setStatus(updateTaskRequest.getStatus());
  // }

  // if (updateTaskRequest.getAssigneeId() != null) {
  // task.setAssignee(entityLookupService.getUser(updateTaskRequest.getAssigneeId()));
  // }

  // taskRepository.save(task);
  // return task.toTaskDto();
  // }

  // public void deleteTask(UUID projectId, Long issueId, Long taskId, Principal
  // principal) {
  // Project project = entityLookupService.getProject(projectId);
  // entityLookupService.checkPrincipalIsCreatorOrCollaborator(project,
  // principal);
  // entityLookupService.getIssue(issueId);
  // Task task = entityLookupService.getTask(taskId);

  // taskRepository.delete(task);
  // }

  public ProjectResponse updateProject(
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

    return convertToDto(project);
  }

  private ProjectResponse convertToDto(Project project) {
    User creator = project.getCreator();

    ProjectResponse.CreatorDto creatorDto =
        ProjectResponse.CreatorDto.builder()
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
