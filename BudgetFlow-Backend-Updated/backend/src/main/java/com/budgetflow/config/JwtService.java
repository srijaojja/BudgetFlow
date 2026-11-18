
package com.budgetflow.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

 private final SecretKey key;

 public JwtService(
         @Value("${app.jwt.secret}") String secret
 ) {
  this.key = Keys.hmacShaKeyFor(
          Decoders.BASE64.decode(secret)
  );
 }

 public String issue(String email) {

  long now = System.currentTimeMillis();

  return Jwts.builder()
          .subject(email)
          .issuedAt(new Date(now))
          .expiration(new Date(now + 86400000L))
          .signWith(key)
          .compact();
 }

 public String subject(String token) {

  return Jwts.parser()
          .verifyWith(key)
          .build()
          .parseSignedClaims(token)
          .getPayload()
          .getSubject();
 }
}
