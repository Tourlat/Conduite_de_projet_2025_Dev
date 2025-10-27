package com.group3.conduitedeprojet.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Table(name = "users")
public class User {

  @Id
  @Column(unique = true)
  private String username;

  @Column(columnDefinition = "text")
  private String firstname;

  @Column(columnDefinition = "text")
  private String lastname;

  @Column(columnDefinition = "text")
  private String passwordHash;
}
