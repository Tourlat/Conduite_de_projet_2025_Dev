package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.Documentation;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentationRepository extends JpaRepository<Documentation, Long> {
  List<Documentation> findByProjectId(UUID projectId);
}
