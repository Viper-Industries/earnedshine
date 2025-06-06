package com.detailing.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SimpleUrlLogoutSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;

@Component
public class CognitoLogoutHandler extends SimpleUrlLogoutSuccessHandler {

    @Value("${cognito.domain:}")
    private String domain;

    @Value("${frontend.url:http://localhost:3000}")
    private String logoutRedirectUrl;

    @Value("${spring.security.oauth2.client.registration.cognito.client-id}")
    private String userPoolClientId;

    @Override
    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        
        if (domain == null || domain.trim().isEmpty()) {
            return logoutRedirectUrl + "/admin/logout/callback";
        }
        
        try {
            return UriComponentsBuilder
                    .fromUri(URI.create(domain + "/logout"))
                    .queryParam("client_id", userPoolClientId)
                    .queryParam("logout_uri", logoutRedirectUrl + "/admin/logout/callback")
                    .encode(StandardCharsets.UTF_8)
                    .build()
                    .toUriString();
        } catch (Exception e) {
            
            System.err.println("Error building Cognito logout URL: " + e.getMessage());
            return logoutRedirectUrl + "/admin/logout/callback";
        }
    }
} 
