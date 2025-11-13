package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.Sprint;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
  List<Sprint> findByProjectId(UUID projectId);
  Optional<Sprint> findByIdAndProjectId(Long id, UUID projectId);
}