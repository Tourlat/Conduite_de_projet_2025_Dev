package com.group3.conduitedeprojet.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateProjectRequest {
    private String name;
    private String description;
    private UserDto user;
    private List<String> collaborateurs;
}
