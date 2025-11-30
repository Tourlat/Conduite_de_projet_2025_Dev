package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.dto.CreateTaskRequest;
import com.group3.conduitedeprojet.dto.TaskDto;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.Task;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.TaskRepository;
import java.security.Principal;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TaskService {

  @Autowired private TaskRepository taskRepository;

  @Autowired private EntityLookupService entityLookupService;

  public TaskDto createTask(
      UUID projectId, Long issueId, CreateTaskRequest createTaskRequest, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    Issue issue = entityLookupService.getIssue(issueId);
    User creator = entityLookupService.getUserByEmail(principal.getName());

    Task.TaskBuilder taskBuilder =
        Task.builder()
            .creator(creator)
            .description(createTaskRequest.getDescription())
            .title(createTaskRequest.getTitle())
            .project(project)
            .issue(issue)
            .definitionOfDone(createTaskRequest.getDefinitionOfDone());

    if (createTaskRequest.getAssigneeId() != null) {
      taskBuilder.assignee(entityLookupService.getUser(createTaskRequest.getAssigneeId()));
    }

    if (createTaskRequest.getStatus() == null) {
      taskBuilder.status(Task.Status.TODO);
    } else {
      taskBuilder.status(createTaskRequest.getStatus());
    }

    Task task = taskBuilder.build();
    taskRepository.save(task);
    return task.toTaskDto();
  }

  public List<TaskDto> getTasksByIssue(UUID projectId, Long issueId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    entityLookupService.getIssue(issueId);

    List<Task> tasks = taskRepository.findByIssueId(issueId);
    return tasks.stream().map(Task::toTaskDto).toList();
  }

  public TaskDto updateTask(
      UUID projectId,
      Long issueId,
      Long taskId,
      CreateTaskRequest updateTaskRequest,
      Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    entityLookupService.getIssue(issueId);
    Task task = entityLookupService.getTask(taskId);

    if (updateTaskRequest.getTitle() != null && !updateTaskRequest.getTitle().trim().isEmpty()) {
      task.setTitle(updateTaskRequest.getTitle().trim());
    }

    if (updateTaskRequest.getDescription() != null) {
      task.setDescription(updateTaskRequest.getDescription().trim());
    }

    if (updateTaskRequest.getDefinitionOfDone() != null) {
      task.setDefinitionOfDone(updateTaskRequest.getDefinitionOfDone().trim());
    }

    if (updateTaskRequest.getStatus() != null) {
      task.setStatus(updateTaskRequest.getStatus());
    }

    if (updateTaskRequest.getAssigneeId() != null) {
      task.setAssignee(entityLookupService.getUser(updateTaskRequest.getAssigneeId()));
    }

    taskRepository.save(task);
    return task.toTaskDto();
  }

  public void deleteTask(UUID projectId, Long issueId, Long taskId, Principal principal) {
    Project project = entityLookupService.getProject(projectId);
    entityLookupService.checkPrincipalIsCreatorOrCollaborator(project, principal);
    entityLookupService.getIssue(issueId);
    Task task = entityLookupService.getTask(taskId);

    taskRepository.delete(task);
  }
}
