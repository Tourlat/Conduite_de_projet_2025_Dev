package com.group3.conduitedeprojet.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.group3.conduitedeprojet.models.Issue;
import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {
    List<Issue>  findByProjectId(java.util.UUID projectId);
}
