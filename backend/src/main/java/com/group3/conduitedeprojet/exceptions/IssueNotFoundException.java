package com.group3.conduitedeprojet.exceptions;

public class IssueNotFoundException extends RuntimeException {
  public IssueNotFoundException(String message) {
    super(message);
  }
}
