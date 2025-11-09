package com.group3.conduitedeprojet.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.group3.conduitedeprojet.models.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {

}

