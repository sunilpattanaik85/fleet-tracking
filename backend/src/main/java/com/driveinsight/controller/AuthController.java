package com.driveinsight.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final String SECRET = Base64.getEncoder().encodeToString("dev-secret-change-me".getBytes());

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        // TODO: persist user and send verification token
        return ResponseEntity.status(201).body(Map.of("ok", true));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> body) {
        // TODO: verify token and mark user
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletResponse res, HttpSession session) {
        String email = body.getOrDefault("email", "");
        String password = body.getOrDefault("password", "");
        if (!email.equalsIgnoreCase("admin@example.com") || !"DemoPassw0rd!".equals(password)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        session.setAttribute("uid", "1");
        String access = Jwts.builder()
                .setSubject("1").claim("email", email).claim("roles", new String[]{"ADMIN"}).claim("scp", new String[]{"read","write"})
                .setIssuer("driveinsight-auth").setAudience("web")
                .setExpiration(Date.from(Instant.now().plusSeconds(600)))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
        // set dummy refresh cookie placeholder
        res.addHeader("Set-Cookie", "refresh=dummy; Path=/api/auth; HttpOnly; SameSite=Lax");
        return ResponseEntity.ok(Map.of("access", access));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletResponse res) {
        // TODO: validate refresh, rotate and issue new access
        return ResponseEntity.status(401).body(Map.of("message", "Not implemented"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session, HttpServletResponse res) {
        session.invalidate();
        res.addHeader("Set-Cookie", "refresh=; Path=/api/auth; Max-Age=0; HttpOnly; SameSite=Lax");
        return ResponseEntity.ok(Map.of("ok", true));
    }
}

