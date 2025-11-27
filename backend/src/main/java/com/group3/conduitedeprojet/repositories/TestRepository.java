package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.Test;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<Test, Long> {
  List<Test> findByIssueId(Long issueId);
}
