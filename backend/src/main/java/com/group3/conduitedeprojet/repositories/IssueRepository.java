package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.Issue;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IssueRepository extends JpaRepository<Issue, Long> {
  List<Issue> findByProjectId(java.util.UUID projectId);

  Optional<Issue> findByIdAndProjectId(Long id, java.util.UUID projectId);
}
