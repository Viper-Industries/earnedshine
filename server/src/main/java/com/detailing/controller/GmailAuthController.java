package com.detailing.controller;

import com.detailing.service.GmailService;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/gmail-auth")
public class GmailAuthController {

    private static final Logger logger = LoggerFactory.getLogger(GmailAuthController.class);
    
    @Autowired
    private GmailService gmailService;
    
    @Value("${gmail.client-id}")
    private String clientId;
    
    @Value("${gmail.client-secret}")
    private String clientSecret;
    
    @Value("${gmail.redirect-uri}")
    private String redirectUri;

    @GetMapping("/auth-url")
    public ResponseEntity<?> getAuthUrl() {
        try {
            String authUrl = gmailService.getAuthorizationUrl();
            logger.info("Generated Gmail authorization URL");
            return ResponseEntity.ok(Map.of("authUrl", authUrl));
        } catch (Exception e) {
            logger.error("Error generating authorization URL", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to generate authorization URL: " + e.getMessage()));
        }
    }

    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestParam String code) {
        try {
            
            TokenResponse tokenResponse = new GoogleAuthorizationCodeTokenRequest(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    clientId,
                    clientSecret,
                    code,
                    redirectUri
            ).execute();

            String refreshToken = tokenResponse.getRefreshToken();
            String accessToken = tokenResponse.getAccessToken();
            
            if (refreshToken != null) {
                logger.info("Successfully obtained refresh token");
                return ResponseEntity.ok(Map.of(
                    "message", "Authorization successful! Please save the refresh token as GMAIL_REFRESH_TOKEN environment variable.",
                    "refreshToken", refreshToken,
                    "accessToken", accessToken
                ));
            } else {
                logger.warn("No refresh token received - user may have already authorized this app");
                return ResponseEntity.ok(Map.of(
                    "message", "No refresh token received. This usually means the app was already authorized. If you need a new refresh token, revoke access and try again.",
                    "accessToken", accessToken
                ));
            }
        } catch (Exception e) {
            logger.error("Error handling OAuth callback", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to process authorization: " + e.getMessage()));
        }
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String toEmail) {
        try {
            
            com.detailing.model.Booking testBooking = new com.detailing.model.Booking();
            testBooking.setBookingId("TEST-" + System.currentTimeMillis());
            testBooking.setName("Test Customer");
            testBooking.setEmail(toEmail);
            testBooking.setPhone("(555) 123-4567");
            testBooking.setAddress("123 Test Street, Test City, TS 12345");
            testBooking.setVehicleType("sedan");
            testBooking.setServiceType("BASIC_WASH");
            testBooking.setAppointmentTime(java.time.LocalDateTime.now().plusDays(1));
            testBooking.setPaymentMethod(com.detailing.model.Booking.PaymentMethod.ONLINE);
            testBooking.setStatus(com.detailing.model.Booking.BookingStatus.PENDING_PAYMENT);
            
            gmailService.sendBookingConfirmation(testBooking);
            
            logger.info("Test email sent successfully to: {}", toEmail);
            return ResponseEntity.ok(Map.of("message", "Test email sent successfully!"));
        } catch (Exception e) {
            logger.error("Error sending test email", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to send test email: " + e.getMessage()));
        }
    }
} 
