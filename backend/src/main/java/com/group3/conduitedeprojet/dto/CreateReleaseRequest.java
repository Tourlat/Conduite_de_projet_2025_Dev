package com.group3.conduitedeprojet.dto;

import com.group3.conduitedeprojet.models.Release;

import java.util.List;
import lombok.Data;

@Data
public class CreateReleaseRequest {
  private Release.Version version;
  private String releaseNotes;
  private List<Long> issueIds;
}
