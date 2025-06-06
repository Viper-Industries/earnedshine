package com.detailing.controller;

import com.detailing.model.Booking;
import com.detailing.service.BookingService;
import com.detailing.service.PricingService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
@CrossOrigin(origins = "${frontend.url}")
public class StripeController {

    private static final Logger logger = LoggerFactory.getLogger(StripeController.class);

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PricingService pricingService;

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Value("${frontend.url}")
    private String frontendUrl;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody Map<String, String> request) {
        try {
            String bookingId = request.get("bookingId");
            logger.info("Creating Stripe checkout session for booking ID: {}", bookingId);

            Booking booking = bookingService.getBookingById(bookingId);
            if (booking == null) {
                logger.error("Booking not found with ID: {}", bookingId);
                return ResponseEntity.badRequest().body(Map.of("error", "Booking not found"));
            }

            int totalPriceCents = pricingService.calculateTotalPrice(booking.getServiceType(), booking.getAddons());
            logger.info("Calculated total price for booking {}: ${}", bookingId, totalPriceCents / 100.0);

            SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/success?bookingId=" + bookingId + "&session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/booking?canceled=true")
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount((long) totalPriceCents)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Car Detailing Service")
                                                                    .setDescription(buildServiceDescription(booking))
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .setQuantity(1L)
                                    .build()
                    )
                    .putMetadata("booking_id", bookingId);

            if (booking.getEmail() != null && !booking.getEmail().isEmpty()) {
                paramsBuilder.setCustomerEmail(booking.getEmail());
            }

            SessionCreateParams params = paramsBuilder.build();
            Session session = Session.create(params);

            booking.setStripeSessionId(session.getId());
            bookingService.updateBooking(booking);

            logger.info("Stripe checkout session created successfully: {}", session.getId());

            Map<String, String> response = new HashMap<>();
            response.put("checkoutUrl", session.getUrl());
            response.put("sessionId", session.getId());

            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            logger.error("Stripe error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create checkout session: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error occurred"));
        }
    }

    private String buildServiceDescription(Booking booking) {
        StringBuilder description = new StringBuilder();
        description.append("Service: ").append(formatServiceName(booking.getServiceType()));
        description.append(", Vehicle: ").append(formatVehicleType(booking.getVehicleType()));
        
        if (booking.getAddons() != null && !booking.getAddons().isEmpty()) {
            description.append(", Add-ons: ");
            for (int i = 0; i < booking.getAddons().size(); i++) {
                if (i > 0) description.append(", ");
                description.append(formatAddonName(booking.getAddons().get(i)));
            }
        }
        
        return description.toString();
    }

    private String formatServiceName(String serviceType) {
        
        String[] words = serviceType.split("_");
        StringBuilder formatted = new StringBuilder();
        for (String word : words) {
            if (formatted.length() > 0) formatted.append(" ");
            formatted.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                formatted.append(word.substring(1).toLowerCase());
            }
        }
        return formatted.toString();
    }

    private String formatVehicleType(String vehicleType) {
        switch (vehicleType) {
            case "sedan": return "Sedan/Coupe";
            case "suv": return "SUV/Minivan";
            case "truck": return "Truck";
            case "motorcycle": return "Motorcycle";
            default: return vehicleType;
        }
    }

    private String formatAddonName(String addon) {
        
        String[] words = addon.split("_");
        StringBuilder formatted = new StringBuilder();
        for (String word : words) {
            if (formatted.length() > 0) formatted.append(" ");
            formatted.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                formatted.append(word.substring(1).toLowerCase());
            }
        }
        return formatted.toString();
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            logger.info("Received Stripe webhook event: {}", event.getType());

            switch (event.getType()) {
                case "checkout.session.completed":
                    handleCheckoutSessionCompleted(event);
                    break;
                default:
                    logger.info("Unhandled event type: {}", event.getType());
            }

            return ResponseEntity.ok("Success");

        } catch (SignatureVerificationException e) {
            logger.error("Invalid signature in Stripe webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            logger.error("Error processing Stripe webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook error");
        }
    }

    private void handleCheckoutSessionCompleted(Event event) {
        try {
            
            Session session = (Session) event.getData().getObject();
            if (session == null) {
                logger.error("Could not deserialize checkout session from webhook");
                return;
            }

            String bookingId = session.getMetadata().get("booking_id");
            logger.info("Processing completed checkout session for booking ID: {}", bookingId);

            Booking booking = bookingService.getBookingById(bookingId);
            if (booking != null) {
                
                if (booking.getStatus() == Booking.BookingStatus.PENDING_PAYMENT) {
                    booking.setStatus(Booking.BookingStatus.CONFIRMED);
                    bookingService.updateBooking(booking);
                    logger.info("Booking {} status updated to CONFIRMED after successful payment", bookingId);
                } else {
                    logger.info("Booking {} already processed, current status: {}", bookingId, booking.getStatus());
                }
            } else {
                logger.error("Booking not found for completed checkout session: {}", bookingId);
            }

        } catch (Exception e) {
            logger.error("Error handling checkout session completed: {}", e.getMessage(), e);
        }
    }
}
