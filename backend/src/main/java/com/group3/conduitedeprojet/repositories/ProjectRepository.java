package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.Project;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, UUID> {}
