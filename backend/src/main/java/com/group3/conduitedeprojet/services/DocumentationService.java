package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.dto.DocumentationDto;
import com.group3.conduitedeprojet.models.Documentation;
import com.group3.conduitedeprojet.models.Project;
import com.group3.conduitedeprojet.repositories.DocumentationRepository;
import com.group3.conduitedeprojet.repositories.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentationService {

    @Autowired
    private DocumentationRepository documentationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public List<DocumentationDto> getDocumentationByProject(UUID projectId) {
        return documentationRepository.findByProjectId(projectId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public DocumentationDto createDocumentation(UUID projectId, DocumentationDto dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        Documentation documentation = Documentation.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .project(project)
                .build();

        Documentation savedDoc = documentationRepository.save(documentation);
        return convertToDto(savedDoc);
    }

    public DocumentationDto updateDocumentation(Long id, DocumentationDto dto) {
        Documentation documentation = documentationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documentation not found"));

        documentation.setTitle(dto.getTitle());
        documentation.setContent(dto.getContent());

        Documentation updatedDoc = documentationRepository.save(documentation);
        return convertToDto(updatedDoc);
    }

    public void deleteDocumentation(Long id) {
        documentationRepository.deleteById(id);
    }

    private DocumentationDto convertToDto(Documentation doc) {
        return DocumentationDto.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .content(doc.getContent())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }
}
