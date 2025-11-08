package com.group3.conduitedeprojet.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.group3.conduitedeprojet.models.Issue;

public interface IssueRepository extends JpaRepository<Issue, Long> {

}
