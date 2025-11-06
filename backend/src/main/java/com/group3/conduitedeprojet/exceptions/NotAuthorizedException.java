package com.group3.conduitedeprojet.exceptions;

public class NotAuthorizedException extends RuntimeException {
  public NotAuthorizedException(String message) {
    super(message);
  }
}
