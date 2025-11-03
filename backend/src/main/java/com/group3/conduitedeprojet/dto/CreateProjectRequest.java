package com.group3.conduitedeprojet.dto;

import lombok.Data;

@Data
public class CreateProjectRequest {
    private String name;
    private String description;
    private UserDto user;
}
