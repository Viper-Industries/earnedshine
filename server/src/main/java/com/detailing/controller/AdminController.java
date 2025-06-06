package com.detailing.controller;

import com.detailing.model.Booking;
import com.detailing.service.AdminService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin") 
@PreAuthorize("hasAuthority('SCOPE_openid') or hasRole('USER')") 
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()") 
    public ResponseEntity<Map<String, Object>> getStats(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(oauth2User, jwt);
        logger.info("Received request for admin stats from user: {}", username);
        try {
            Map<String, Object> stats = adminService.getBookingStats();
            logger.info("Successfully retrieved booking stats: {}", stats);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving booking stats", e);
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to retrieve booking statistics",
                "message", e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/bookings")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(value = "includeHidden", defaultValue = "false") boolean includeHidden,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(oauth2User, jwt);
        logger.info("Received request for all bookings from user: {}, includeHidden: {}", username, includeHidden);
        try {
            List<Booking> bookings = adminService.getAllBookings(includeHidden);
            logger.info("Successfully retrieved {} bookings", bookings.size());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error retrieving all bookings", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/bookings/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> updateBooking(
            @PathVariable String bookingId,
            @RequestBody Booking updatedBooking,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(oauth2User, jwt);
        logger.info("Received request to update booking: {} from user: {}", bookingId, username);
        try {
            Booking updated = adminService.updateBooking(bookingId, updatedBooking);
            Map<String, Object> response = Map.of(
                "message", "Booking updated successfully",
                "booking", updated
            );
            logger.info("Successfully updated booking: {}", bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating booking: {}", bookingId, e);
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to update booking",
                "message", e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/bookings/{bookingId}/hide")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> hideBooking(
            @PathVariable String bookingId,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(oauth2User, jwt);
        logger.info("Received request to hide booking: {} from user: {}", bookingId, username);
        try {
            adminService.hideBooking(bookingId);
            Map<String, Object> response = Map.of(
                "message", "Booking hidden successfully",
                "bookingId", bookingId
            );
            logger.info("Successfully hidden booking: {}", bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error hiding booking: {}", bookingId, e);
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to hide booking",
                "message", e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/bookings/{bookingId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> cancelBooking(
            @PathVariable String bookingId,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(oauth2User, jwt);
        logger.info("Received request to cancel booking: {} from user: {}", bookingId, username);
        try {
            adminService.cancelBooking(bookingId);
            Map<String, Object> response = Map.of(
                "message", "Booking canceled successfully",
                "bookingId", bookingId
            );
            logger.info("Successfully canceled booking: {}", bookingId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error canceling booking: {}", bookingId, e);
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to cancel booking",
                "message", e.getMessage()
            );
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/bookings/cleanup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> cleanupCanceledBookings(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @AuthenticationPrincipal Jwt jwt) {
        String username = getUsername(oauth2User, jwt);
        logger.info("Received request to cleanup canceled and completed bookings from user: {}", username);
        try {
            int hiddenCount = adminService.hideCompletedAndCanceledBookings();
            Map<String, Object> response = Map.of(
                "message", "Canceled and completed bookings hidden successfully",
                "hiddenCount", hiddenCount
            );
            logger.info("Successfully hidden {} canceled and completed bookings", hiddenCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error hiding canceled and completed bookings", e);
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to hide canceled and completed bookings",
                "message", e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @AuthenticationPrincipal Jwt jwt) {
        logger.info("Received request for current user info");
        try {
            String username;
            String email;
            String phone = "unknown";
            String subject;

            if (oauth2User != null) {
                
                username = oauth2User.getAttribute("username");
                email = oauth2User.getAttribute("email");
                String phoneNumber = oauth2User.getAttribute("phone_number");
                if (phoneNumber != null) {
                    phone = phoneNumber;
                }
                subject = oauth2User.getAttribute("sub");
                logger.info("Using OAuth2User authentication for: {}", username);
            } else if (jwt != null) {
                
                username = jwt.getClaimAsString("username");
                email = jwt.getClaimAsString("email");
                String phoneNumber = jwt.getClaimAsString("phone_number");
                if (phoneNumber != null) {
                    phone = phoneNumber;
                }
                subject = jwt.getSubject();
                logger.info("Using JWT authentication for: {}", username);
            } else {
                throw new SecurityException("No valid authentication found");
            }
            
            Map<String, Object> userInfo = Map.of(
                    "username", username != null ? username : "unknown",
                    "email", email != null ? email : "unknown",
                    "phone", phone,
                    "subject", subject != null ? subject : "unknown",
                    "roles", "ROLE_ADMIN",
                    "authenticated", true
            );
            
            logger.info("Successfully retrieved user info for: {}", username);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            logger.error("Error retrieving current user info", e);
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to retrieve user information",
                "message", e.getMessage(),
                "authenticated", false
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    private String getUsername(OAuth2User oauth2User, Jwt jwt) {
        if (oauth2User != null) {
            return oauth2User.getAttribute("username");
        } else if (jwt != null) {
            return jwt.getClaimAsString("username");
        }
        return "unknown";
    }
}
