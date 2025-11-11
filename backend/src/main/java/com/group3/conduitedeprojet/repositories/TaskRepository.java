package com.group3.conduitedeprojet.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.group3.conduitedeprojet.models.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
  List<Task> findByIssueId(Long issueId);
}

