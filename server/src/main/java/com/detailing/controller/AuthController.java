package com.detailing.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@PreAuthorize("hasAuthority('SCOPE_openid') or hasRole('USER')")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${spring.security.oauth2.client.registration.cognito.client-id}")
    private String clientId;

    @Value("${cognito.domain:}")
    private String cognitoDomain;

    @Value("${frontend.url}")
    private String frontendUrl;

    @GetMapping("/login-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getLoginUrl() {
        logger.info("Authenticated user requesting login URL");
        String loginUrl = "/oauth2/authorization/cognito";
        
        Map<String, String> response = Map.of(
            "loginUrl", loginUrl,
            "message", "Redirect to this URL to initiate Cognito login"
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logout-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getLogoutUrl(@AuthenticationPrincipal OAuth2User user) {
        logger.info("Authenticated user {} requesting logout URL", user != null ? user.getAttribute("username") : "unknown");
        
        if (cognitoDomain == null || cognitoDomain.trim().isEmpty()) {
            String localLogoutUrl = frontendUrl + "/admin/logout/callback";
            Map<String, String> response = Map.of(
                "logoutUrl", localLogoutUrl,
                "message", "Using local logout (Cognito domain not configured)"
            );
            return ResponseEntity.ok(response);
        }
        
        String logoutUrl = cognitoDomain + "/logout?client_id=" + clientId + "&logout_uri=" + frontendUrl + "/admin/logout/callback";
        
        Map<String, String> response = Map.of(
            "logoutUrl", logoutUrl,
            "message", "Redirect to this URL to logout from Cognito"
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getAuthStatus(@AuthenticationPrincipal OAuth2User user) {
        logger.info("Authenticated user {} requesting auth status", user != null ? user.getAttribute("username") : "unknown");
        
        if (user != null) {
            Map<String, Object> response = Map.of(
                "authenticated", true,
                "user", Map.of(
                    "username", user.getAttribute("username"),
                    "email", user.getAttribute("email")
                )
            );
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = Map.of(
                "authenticated", false,
                "message", "User not authenticated"
            );
            return ResponseEntity.ok(response);
        }
    }
} 
