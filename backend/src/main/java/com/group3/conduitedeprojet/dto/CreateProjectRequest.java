package com.group3.conduitedeprojet.dto;

import lombok.Data;

import java.util.Optional;

@Data
public class CreateProjectRequest {
    private String name;
    private Optional<String> description;
    private UserDto user;
}
