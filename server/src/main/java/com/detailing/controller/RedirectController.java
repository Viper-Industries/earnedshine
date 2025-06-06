package com.detailing.controller;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.Instant;
import java.util.Date;

@Controller
public class RedirectController {

    @Value("${frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @GetMapping("/admin")
    public String redirectToAdmin(@AuthenticationPrincipal OAuth2User user) {
        if (user != null) {
            try {
                
                String token = generateJwtToken(user);
                return "redirect:" + frontendUrl + "/admin?token=" + token;
            } catch (Exception e) {
                
                return "redirect:" + frontendUrl + "/admin?error=token_generation_failed";
            }
        } else {
            return "redirect:" + frontendUrl + "/admin?error=authentication_failed";
        }
    }

    private String generateJwtToken(OAuth2User user) throws Exception {
        
        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .subject(user.getAttribute("sub"))
                .claim("username", user.getAttribute("username"))
                .claim("email", user.getAttribute("email"))
                .claim("phone_number", user.getAttribute("phone_number"))
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plusSeconds(604800))); 

        JWTClaimsSet claims = claimsBuilder.build();

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

        SignedJWT signedJWT = new SignedJWT(header, claims);
        JWSSigner signer = new MACSigner(jwtSecret.getBytes());
        signedJWT.sign(signer);

        return signedJWT.serialize();
    }
} 
