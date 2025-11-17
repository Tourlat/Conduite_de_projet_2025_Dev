package com.group3.conduitedeprojet.exceptions;

public class IssueDoesntBelongToProjectException extends RuntimeException {
  public IssueDoesntBelongToProjectException(String message) {
    super(message);
  }
}
