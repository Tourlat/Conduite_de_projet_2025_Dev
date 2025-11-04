package com.group3.conduitedeprojet.repositories;

import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.models.User;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.collaborators c WHERE p.creator = :user OR c = :user")
    List<Project> findAllByUserParticipation(@Param("user") User user);
}
