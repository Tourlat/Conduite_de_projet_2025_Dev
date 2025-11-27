package com.group3.conduitedeprojet.services;

import com.group3.conduitedeprojet.dto.DocumentationIssueDto;
import com.group3.conduitedeprojet.models.Documentation;
import com.group3.conduitedeprojet.models.DocumentationIssue;
import com.group3.conduitedeprojet.models.Issue;
import com.group3.conduitedeprojet.repositories.DocumentationIssueRepository;
import com.group3.conduitedeprojet.repositories.DocumentationRepository;
import com.group3.conduitedeprojet.repositories.IssueRepository;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DocumentationIssueService {

  @Autowired private DocumentationIssueRepository documentationIssueRepository;

  @Autowired private DocumentationRepository documentationRepository;

  @Autowired private IssueRepository issueRepository;

  private static final DateTimeFormatter FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

  public List<DocumentationIssueDto> getIssuesByDocumentation(Long documentationId) {
    return documentationIssueRepository.findByDocumentationId(documentationId).stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public List<DocumentationIssueDto> getDocumentationsByIssue(Long issueId) {
    return documentationIssueRepository.findByIssueId(issueId).stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  @Transactional
  public DocumentationIssueDto linkDocumentationToIssue(Long documentationId, Long issueId) {
    // Vérifier que la documentation existe
    Documentation documentation =
        documentationRepository
            .findById(documentationId)
            .orElseThrow(() -> new RuntimeException("Documentation not found"));

    // Vérifier que l'issue existe
    Issue issue =
        issueRepository
            .findById(issueId)
            .orElseThrow(() -> new RuntimeException("Issue not found"));

    // Vérifier que l'issue appartient au même projet que la documentation
    if (!issue.getProject().getId().equals(documentation.getProject().getId())) {
      throw new RuntimeException("Issue does not belong to the same project as documentation");
    }

    // Vérifier si la liaison existe déjà
    if (documentationIssueRepository
        .findByDocumentationIdAndIssueId(documentationId, issueId)
        .isPresent()) {
      throw new RuntimeException("Link already exists");
    }

    // Créer la liaison
    DocumentationIssue link =
        DocumentationIssue.builder().documentation(documentation).issue(issue).build();

    DocumentationIssue savedLink = documentationIssueRepository.save(link);
    return convertToDto(savedLink);
  }

  @Transactional
  public void unlinkDocumentationFromIssue(Long documentationId, Long issueId) {
    DocumentationIssue link =
        documentationIssueRepository
            .findByDocumentationIdAndIssueId(documentationId, issueId)
            .orElseThrow(() -> new RuntimeException("Link not found"));

    documentationIssueRepository.delete(link);
  }

  private DocumentationIssueDto convertToDto(DocumentationIssue link) {
    return DocumentationIssueDto.builder()
        .id(link.getId())
        .documentationId(link.getDocumentation().getId())
        .issueId(link.getIssue().getId())
        .issueTitle(link.getIssue().getTitle())
        .issuePriority(link.getIssue().getPriority().toString())
        .issueStatus(link.getIssue().getStatus().toString())
        .createdAt(link.getCreatedAt().format(FORMATTER))
        .build();
  }
}
