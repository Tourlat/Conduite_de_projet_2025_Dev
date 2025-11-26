package com.group3.conduitedeprojet.repository;

import com.group3.conduitedeprojet.models.DocumentationIssue;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentationIssueRepository extends JpaRepository<DocumentationIssue, Long> {
  List<DocumentationIssue> findByDocumentationId(Long documentationId);

  List<DocumentationIssue> findByIssueId(Long issueId);

  Optional<DocumentationIssue> findByDocumentationIdAndIssueId(Long documentationId, Long issueId);

  void deleteByDocumentationIdAndIssueId(Long documentationId, Long issueId);
}
