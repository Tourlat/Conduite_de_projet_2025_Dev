package com.group3.conduitedeprojet.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import com.group3.conduitedeprojet.dto.ErrorResponse;
import com.group3.conduitedeprojet.exceptions.EmailAlreadyExistsException;
import com.group3.conduitedeprojet.exceptions.InvalidCredentialsException;
import com.group3.conduitedeprojet.exceptions.NotAuthorizedException;
import com.group3.conduitedeprojet.exceptions.ProjectNotFoundException;
import com.group3.conduitedeprojet.exceptions.UserNotFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(EmailAlreadyExistsException.class)
  public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException ex,
      WebRequest request) {

    ErrorResponse error = ErrorResponse.builder().status(HttpStatus.CONFLICT.value())
        .message(ex.getMessage()).error("EMAIL_ALREADY_EXISTS").timestamp(LocalDateTime.now())
        .path(request.getDescription(false).replace("uri=", "")).build();

    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
  }

  @ExceptionHandler(UserNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex,
      WebRequest request) {

    ErrorResponse error = ErrorResponse.builder().status(HttpStatus.NOT_FOUND.value())
        .message(ex.getMessage()).error("USER_NOT_FOUND").timestamp(LocalDateTime.now())
        .path(request.getDescription(false).replace("uri=", "")).build();

    return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(InvalidCredentialsException.class)
  public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex,
      WebRequest request) {

    ErrorResponse error = ErrorResponse.builder().status(HttpStatus.UNAUTHORIZED.value())
        .message(ex.getMessage()).error("INVALID_CREDENTIALS").timestamp(LocalDateTime.now())
        .path(request.getDescription(false).replace("uri=", "")).build();

    return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex,
      WebRequest request) {

    ErrorResponse error = ErrorResponse.builder().status(HttpStatus.UNAUTHORIZED.value())
        .message("Email ou mot de passe incorrect").error("BAD_CREDENTIALS")
        .timestamp(LocalDateTime.now()).path(request.getDescription(false).replace("uri=", ""))
        .build();

    return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(ProjectNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleProjectNotFond(ProjectNotFoundException ex,
      WebRequest request) {

    ErrorResponse error = ErrorResponse.builder().status(HttpStatus.NOT_FOUND.value())
        .message("Project was not found").error("PROJECT_NOT_FOUND").timestamp(LocalDateTime.now())
        .path(request.getDescription(false).replace("uri=", "")).build();

    return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(NotAuthorizedException.class)
  public ResponseEntity<ErrorResponse> handleNotAuthorized(NotAuthorizedException ex,
      WebRequest request) {

    ErrorResponse error = ErrorResponse.builder().status(HttpStatus.FORBIDDEN.value())
        .message("Not authorized to perform this action.").error("FORBIDDEN")
        .timestamp(LocalDateTime.now()).path(request.getDescription(false).replace("uri=", ""))
        .build();

    return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, WebRequest request) {

    ErrorResponse error = ErrorResponse.builder().status(HttpStatus.INTERNAL_SERVER_ERROR.value())
        .message("Une erreur interne s'est produite").error("INTERNAL_SERVER_ERROR")
        .timestamp(LocalDateTime.now()).path(request.getDescription(false).replace("uri=", ""))
        .build();

    return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
