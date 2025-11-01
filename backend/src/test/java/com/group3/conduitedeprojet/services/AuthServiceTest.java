package com.group3.conduitedeprojet.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.group3.conduitedeprojet.dto.AuthResponse;
import com.group3.conduitedeprojet.dto.LoginRequest;
import com.group3.conduitedeprojet.dto.RegisterRequest;
import com.group3.conduitedeprojet.exceptions.EmailAlreadyExistsException;
import com.group3.conduitedeprojet.exceptions.InvalidCredentialsException;
import com.group3.conduitedeprojet.exceptions.UserNotFoundException;
import com.group3.conduitedeprojet.models.User;
import com.group3.conduitedeprojet.repositories.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

  @Mock
  private UserRepository userRepository;

  @Mock
  private PasswordEncoder passwordEncoder;

  @Mock
  private JwtService jwtService;

  @Mock
  private AuthenticationManager authenticationManager;

  @InjectMocks
  private AuthService authService;

  private RegisterRequest registerRequest;
  private LoginRequest loginRequest;
  private User testUser;

  @BeforeEach
  public void setUp() {
    registerRequest = new RegisterRequest();
    registerRequest.setEmail("test@example.com");
    registerRequest.setPassword("password123");
    registerRequest.setName("John Doe");

    loginRequest = new LoginRequest();
    loginRequest.setEmail("test@example.com");
    loginRequest.setPassword("password123");

    testUser = User.builder().id(1L).email("test@example.com").password("encodedPassword")
        .name("John Doe").enabled(true).build();
  }

  @Test
  public void testRegisterSuccess() {
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
    when(userRepository.save(any(User.class))).thenReturn(testUser);
    when(jwtService.generateToken(any())).thenReturn("jwt_token_123");

    AuthResponse response = authService.register(registerRequest);

    assertNotNull(response);
    assertEquals("test@example.com", response.getEmail());
    assertEquals("John Doe", response.getName());
    assertEquals("jwt_token_123", response.getToken());
    verify(userRepository, times(1)).save(any(User.class));
    verify(passwordEncoder, times(1)).encode("password123");
  }

  @Test
  public void testRegisterEmailAlreadyExists() {
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

    assertThrows(EmailAlreadyExistsException.class, () -> {
      authService.register(registerRequest);
    });

    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  public void testRegisterPasswordIsEncoded() {
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
    when(userRepository.save(any(User.class))).thenReturn(testUser);
    when(jwtService.generateToken(any())).thenReturn("jwt_token");

    authService.register(registerRequest);

    verify(passwordEncoder, times(1)).encode("password123");
  }

  @Test
  public void testRegisterTokenGenerated() {
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
    when(userRepository.save(any(User.class))).thenReturn(testUser);
    when(jwtService.generateToken(any())).thenReturn("jwt_token");

    AuthResponse response = authService.register(registerRequest);

    assertNotNull(response.getToken());
    verify(jwtService, times(1)).generateToken(any());
  }

  @Test
  public void testLoginSuccess() {
    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
        .thenReturn(new UsernamePasswordAuthenticationToken("test@example.com", "password123"));
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
    when(jwtService.generateToken(any())).thenReturn("jwt_token_456");

    AuthResponse response = authService.login(loginRequest);

    assertNotNull(response);
    assertEquals("test@example.com", response.getEmail());
    assertEquals("John Doe", response.getName());
    assertEquals("jwt_token_456", response.getToken());
  }

  @Test
  public void testLoginInvalidCredentials() {
    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
        .thenThrow(new BadCredentialsException("Invalid credentials"));

    assertThrows(InvalidCredentialsException.class, () -> {
      authService.login(loginRequest);
    });

    verify(userRepository, never()).findByEmail(anyString());
  }

  @Test
  public void testLoginUserNotFound() {
    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
        .thenReturn(new UsernamePasswordAuthenticationToken("test@example.com", "password123"));
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

    assertThrows(UserNotFoundException.class, () -> {
      authService.login(loginRequest);
    });
  }

  @Test
  public void testLoginWrongPassword() {
    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
        .thenThrow(new BadCredentialsException("Bad credentials"));

    assertThrows(InvalidCredentialsException.class, () -> {
      authService.login(loginRequest);
    });
  }

  @Test
  public void testRegisterUserEnabledByDefault() {
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
    when(userRepository.save(any(User.class))).thenReturn(testUser);
    when(jwtService.generateToken(any())).thenReturn("jwt_token");

    authService.register(registerRequest);

    verify(userRepository).save(argThat(user -> user.isEnabled()));
  }

  @Test
  public void testMultipleRegistersSameUserFails() {
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
    when(userRepository.save(any(User.class))).thenReturn(testUser);
    when(jwtService.generateToken(any())).thenReturn("jwt_token");

    authService.register(registerRequest);

    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

    assertThrows(EmailAlreadyExistsException.class, () -> {
      authService.register(registerRequest);
    });
  }

  @Test
  public void testLoginAfterRegister() {
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
    when(userRepository.save(any(User.class))).thenReturn(testUser);
    when(jwtService.generateToken(any())).thenReturn("jwt_token_123");

    AuthResponse registerResponse = authService.register(registerRequest);
    assertNotNull(registerResponse.getToken());

    when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
        .thenReturn(new UsernamePasswordAuthenticationToken("test@example.com", "password123"));
    when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
    when(jwtService.generateToken(any())).thenReturn("jwt_token_456");

    AuthResponse loginResponse = authService.login(loginRequest);
    assertNotNull(loginResponse.getToken());
  }
}
