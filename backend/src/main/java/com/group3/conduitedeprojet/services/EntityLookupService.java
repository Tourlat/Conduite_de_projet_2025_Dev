package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.exceptions.IssueNotFoundException;
import com.group3.conduitedeprojet.exceptions.NotAuthorizedException;
import com.group3.conduitedeprojet.exceptions.ProjectNotFoundException;
import com.group3.conduitedeprojet.exceptions.TaskNotFoundException;
import com.group3.conduitedeprojet.exceptions.UserNotFoundException;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.Task;
import com.group3.conduitedeprojet.models.Test;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.IssueRepository;
import com.group3.conduitedeprojet.repositories.ProjectRepository;
import com.group3.conduitedeprojet.repositories.TaskRepository;
import com.group3.conduitedeprojet.repositories.TestRepository;
import com.group3.conduitedeprojet.repositories.UserRepository;
import java.security.Principal;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EntityLookupService {

  @Autowired private UserRepository userRepository;
  @Autowired private ProjectRepository projectRepository;
  @Autowired private TaskRepository taskRepository;
  @Autowired private IssueRepository issueRepository;
  @Autowired private TestRepository testRepository;

  public Project getProject(UUID projectId) {
    Optional<Project> optionalProject = projectRepository.findById(projectId);
    if (optionalProject.isEmpty()) {
      throw new ProjectNotFoundException("Project with id " + projectId + " was not found");
    }
    return optionalProject.get();
  }

  public Issue getIssue(Long issueId) {
    Optional<Issue> optionalIssue = issueRepository.findById(issueId);
    if (optionalIssue.isEmpty()) {
      throw new IssueNotFoundException("Issue with id " + issueId + " was not found");
    }
    return optionalIssue.get();
  }

  public Task getTask(Long taskId) {
    Optional<Task> optionalTask = taskRepository.findById(taskId);
    if (optionalTask.isEmpty()) {
      throw new TaskNotFoundException("Task with id " + taskId + " was not found");
    }
    return optionalTask.get();
  }

  public User getUser(Long userId) {
    Optional<User> optionalUser = userRepository.findById(userId);
    if (optionalUser.isEmpty()) {
      throw new UserNotFoundException("User with id " + userId + " was not found");
    }
    return optionalUser.get();
  }

  public User getUserByEmail(String email) {
    Optional<User> optionalUser = userRepository.findByEmail(email);
    if (optionalUser.isEmpty()) {
      throw new UserNotFoundException("User with email " + email + " was not found");
    }
    return optionalUser.get();
  }

  public Test getTest(Long testId) {
    Optional<Test> optionalTest = testRepository.findById(testId);
    if (optionalTest.isEmpty()) {
      throw new TaskNotFoundException("Test with id " + testId + " was not found");
    }
    return optionalTest.get();
  }

  public void checkPrincipalIsCreator(Project project, Principal principal) {
    if (!project.getCreator().getUsername().equals(principal.getName())) {
      throw new NotAuthorizedException("Only the project creator can make changes");
    }
  }

  public void checkPrincipalIsCreatorOrCollaborator(Project project, Principal principal) {
    boolean principalIsCollaborator =
        project.getCollaborators().stream()
            .map(User::getEmail)
            .anyMatch(collaboratorEmail -> collaboratorEmail.equals(principal.getName()));

    if (!project.getCreator().getUsername().equals(principal.getName())
        && !principalIsCollaborator) {
      throw new NotAuthorizedException("Only a collaborator or creator can make change");
    }
  }
}
