package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.Task;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
  List<Task> findByIssueId(Long issueId);
}
