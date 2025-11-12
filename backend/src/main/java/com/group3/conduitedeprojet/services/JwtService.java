package com.group3.conduitedeprojet.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  @Value("${security.jwt.secret-key}")
  private String secretKey;

  @Value("${security.jwt.expiration-ms}")
  private long jwtExpirationMs;

  /**
   * Extract username from JWT token
   * 
   * @param token the JWT token
   * @return the username contained in the token
   */
  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  /**
   * Extract a specific claim from JWT token
   * 
   * @param token the JWT token
   * @param claimsResolver function to extract the claim
   * @param <T> type of the claim
   * @return the extracted claim
   */
  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }

  private Claims extractAllClaims(String token) {
    return Jwts.parser()
        .verifyWith(getSignInKey())
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  /**
   * Generate a JWT token for a user
   * 
   * @param userDetails the user details
   * @return the generated JWT token
   */
  public String generateToken(UserDetails userDetails) {
    return generateToken(new HashMap<>(), userDetails);
  }

  public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
    return buildToken(extraClaims, userDetails.getUsername(), jwtExpirationMs);
  }

  public long getExpirationTime() {
    return jwtExpirationMs;
  }

  private String buildToken(
      Map<String, Object> extraClaims,
      String username,
      long expirationMillis) {
    Instant now = Instant.now();
    Instant expiration = now.plusMillis(expirationMillis);

    return Jwts.builder()
        .claims(extraClaims)
        .subject(username)
        .issuedAt(Date.from(now))
        .expiration(Date.from(expiration))
        .signWith(getSignInKey())
        .compact();
  }

  private SecretKey getSignInKey() {
    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}
