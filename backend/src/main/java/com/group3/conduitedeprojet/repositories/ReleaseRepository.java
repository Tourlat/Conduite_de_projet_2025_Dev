package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.Release;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReleaseRepository extends JpaRepository<Release, Long> {
  List<Release> findByProjectId(UUID projectId);
}
