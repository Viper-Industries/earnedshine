package com.detailing.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletResponse;

import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CognitoLogoutHandler cognitoLogoutHandler;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) 
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()
                .requestMatchers("/api/admin/**").authenticated()
                .requestMatchers("/api/availability/block-slot", "/api/availability/unblock-slot", 
                               "/api/availability/block-day", "/api/availability/unblock-day",
                               "/api/availability/cancel-booking").authenticated()
                .requestMatchers("/api/bookings/**", "/api/stripe/**", "/api/availability/**").permitAll()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(customJwtDecoder()))
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler((request, response, authentication) -> {
                    try {
                        OAuth2User user = (OAuth2User) authentication.getPrincipal();
                        System.out.println("OAuth2User details: " + user.getAttributes());
                        String token = generateJwtToken(user);
                        System.out.println("Generated JWT token: " + token);
                        
                        String frontendUrl = request.getServletContext().getInitParameter("frontendUrl");
                        if (frontendUrl == null) {
                            frontendUrl = "http://localhost:3000";
                        }
                        String redirectUrl = frontendUrl + "/admin?token=" + token;
                        System.out.println("Redirecting to: " + redirectUrl);
                        response.sendRedirect(redirectUrl);
                    } catch (Exception e) {
                        System.err.println("Error during token generation or redirect: " + e.getMessage());
                        e.printStackTrace();
                        try {
                            response.sendRedirect("http://localhost:3000/admin?error=token_generation_failed");
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    }
                })
                .failureUrl("/admin?error=true")
            )
            .logout(logout -> logout
                .logoutSuccessHandler(cognitoLogoutHandler)
                .logoutUrl("/logout")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
            )
            .csrf(csrf -> csrf.disable()) 
            .cors(cors -> cors.configurationSource(corsConfigurationSource()));
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
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

    @Bean
    public JwtDecoder customJwtDecoder() {
        return token -> {
            try {
                SignedJWT signedJWT = SignedJWT.parse(token);
                
                MACVerifier verifier = new MACVerifier(jwtSecret.getBytes());
                if (!signedJWT.verify(verifier)) {
                    throw new JwtException("Invalid JWT signature");
                }
                
                JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
                Date expiration = claims.getExpirationTime();
                if (expiration != null && expiration.before(new Date())) {
                    throw new JwtException("JWT token has expired");
                }
                
                Map<String, Object> headers = new HashMap<>();
                headers.put("typ", "JWT");
                headers.put("alg", "HS256");
                
                Map<String, Object> claimsMap = new HashMap<>();
                claimsMap.put("sub", claims.getSubject());
                claimsMap.put("username", claims.getClaim("username"));
                claimsMap.put("email", claims.getClaim("email"));
                claimsMap.put("phone_number", claims.getClaim("phone_number"));
                claimsMap.put("exp", claims.getExpirationTime());
                claimsMap.put("iat", claims.getIssueTime());
                
                return new Jwt(token, claims.getIssueTime().toInstant(), 
                             claims.getExpirationTime().toInstant(), headers, claimsMap);
                             
            } catch (Exception e) {
                throw new JwtException("Failed to decode JWT token: " + e.getMessage(), e);
            }
        };
    }
} 
