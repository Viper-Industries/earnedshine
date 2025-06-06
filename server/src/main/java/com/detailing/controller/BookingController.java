package com.detailing.controller;

import com.detailing.model.Booking;
import com.detailing.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);
    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking bookingDetails) {
        logger.info("Received booking creation request: {}", bookingDetails);
        try {
            Booking createdBooking = bookingService.createBooking(bookingDetails);
            logger.info("Booking created successfully with ID: {}", createdBooking.getBookingId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("bookingId", createdBooking.getBookingId()));
        } catch (Exception e) {
            logger.error("Error creating booking: {}", bookingDetails, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error creating booking: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable String id) {
        logger.info("Received request to get booking by ID: {}", id);
        try {
            Booking booking = bookingService.getBookingById(id);
            if (booking != null) {
                return ResponseEntity.ok(booking);
            }
            logger.warn("Booking not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Booking not found"));
        } catch (Exception e) {
            logger.error("Error fetching booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching booking: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBookings(@RequestParam(value = "includeHidden", defaultValue = "false") boolean includeHidden) {
        logger.info("Received request to get all bookings, includeHidden: {}", includeHidden);
        try {
            
            java.util.List<Booking> bookings = bookingService.getAllBookings(includeHidden);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching all bookings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error fetching bookings: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable String id, @RequestBody Booking bookingDetails) {
        logger.info("Received request to update booking with ID: {}", id);
        try {
            
            Booking existingBooking = bookingService.getBookingById(id);
            if (existingBooking == null) {
                logger.warn("Booking not found with ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Booking not found"));
            }
            
            bookingDetails.setBookingId(id); 
            Booking updatedBooking = bookingService.updateBooking(bookingDetails);
            logger.info("Booking updated successfully with ID: {}", id);
            return ResponseEntity.ok(updatedBooking);
        } catch (Exception e) {
            logger.error("Error updating booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating booking: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/hide")
    public ResponseEntity<?> hideBooking(@PathVariable String id) {
        logger.info("Received request to hide booking with ID: {}", id);
        try {
            
            Booking booking = bookingService.getBookingById(id);
            if (booking == null) {
                logger.warn("Booking not found with ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Booking not found"));
            }
            
            booking.setHidden(true);
            bookingService.updateBooking(booking);
            logger.info("Booking hidden successfully with ID: {}", id);
            return ResponseEntity.ok(Map.of("message", "Booking hidden successfully"));
        } catch (Exception e) {
            logger.error("Error hiding booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error hiding booking: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable String id) {
        logger.info("Received request to cancel booking with ID: {}", id);
        try {
            
            bookingService.cancelBooking(id);
            logger.info("Booking canceled successfully with ID: {}", id);
            return ResponseEntity.ok(Map.of("message", "Booking canceled successfully"));
        } catch (Exception e) {
            logger.error("Error canceling booking with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error canceling booking: " + e.getMessage()));
        }
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<?> cleanupCanceledBookings() {
        logger.info("Received request to cleanup canceled bookings");
        try {
            
            int hiddenCount = bookingService.hideCanceledBookings();
            logger.info("Hidden {} canceled bookings", hiddenCount);
            return ResponseEntity.ok(Map.of("message", "Cleanup completed", "hiddenCount", hiddenCount));
        } catch (Exception e) {
            logger.error("Error cleaning up canceled bookings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error cleaning up bookings: " + e.getMessage()));
        }
    }
    
}
