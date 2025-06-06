package com.detailing.controller;

import com.detailing.model.Availability;
import com.detailing.model.Booking;
import com.detailing.service.AvailabilityService;
import com.detailing.service.AdminService;
import com.detailing.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.detailing.util.TimeSlotUtil;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin(origins = "${frontend.url}")
public class AvailabilityController {

    private static final Logger logger = LoggerFactory.getLogger(AvailabilityController.class);
    private final AvailabilityService availabilityService;
    private final AdminService adminService;
    private final BookingRepository bookingRepository;

    @Autowired
    public AvailabilityController(AvailabilityService availabilityService,
                                 AdminService adminService,
                                 BookingRepository bookingRepository) {
        this.availabilityService = availabilityService;
        this.adminService = adminService;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping("/slots/{date}")
    public ResponseEntity<?> getAvailableSlots(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String excludeBookingId) {
        try {
            logger.info("Getting available slots for date: {}, service: {}, excluding booking: {}", 
                       date, serviceType, excludeBookingId);

            if (availabilityService.isDayBlocked(date)) {
                logger.info("Day {} is blocked entirely", date);
                return ResponseEntity.ok(Map.of("availableSlots", List.of()));
            }

            List<String> availableSlots = availabilityService.findStartSlots(date, serviceType, excludeBookingId);

            logger.info("Found {} available start slots for date {} and service {}",
                    availableSlots.size(), date, serviceType);
            return ResponseEntity.ok(Map.of("availableSlots", availableSlots));

        } catch (Exception e) {
            logger.error("Error getting available slots for date {}: {}", date, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get available slots"));
        }
    }

    @GetMapping("/{date}")
    public ResponseEntity<?> getAvailabilityForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            logger.info("Getting availability for date: {}", date);
            List<Availability> availability = availabilityService.getAvailabilityForDate(date);
            return ResponseEntity.ok(availability);
        } catch (Exception e) {
            logger.error("Error getting availability for date {}: {}", date, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get availability"));
        }
    }

    @PostMapping("/block-day")
    public ResponseEntity<?> blockDay(@RequestBody Map<String, String> request) {
        try {
            String dateStr = request.get("date");
            String reason = request.get("reason");
            LocalDate date = LocalDate.parse(dateStr);

            logger.info("Blocking day {} with reason: {}", date, reason);
            availabilityService.blockDay(date, reason);

            return ResponseEntity.ok(Map.of("message", "Day blocked successfully"));
        } catch (Exception e) {
            logger.error("Error blocking day: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to block day"));
        }
    }

    @PostMapping("/unblock-day")
    public ResponseEntity<?> unblockDay(@RequestBody Map<String, String> request) {
        try {
            String dateStr = request.get("date");
            LocalDate date = LocalDate.parse(dateStr);

            logger.info("Unblocking day {}", date);
            availabilityService.unblockDay(date);

            return ResponseEntity.ok(Map.of("message", "Day unblocked successfully"));
        } catch (Exception e) {
            logger.error("Error unblocking day: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to unblock day"));
        }
    }

    @PostMapping("/block-slot")
    public ResponseEntity<?> blockSlot(@RequestBody Map<String, String> request) {
        try {
            String dateStr = request.get("date");
            String slot = request.get("slot");
            String reason = request.get("reason");
            LocalDate date = LocalDate.parse(dateStr);

            logger.info("Blocking slot {} on {} with reason: {}", slot, date, reason);
            availabilityService.blockSlot(date, slot, reason);

            return ResponseEntity.ok(Map.of("message", "Slot blocked successfully"));
        } catch (Exception e) {
            logger.error("Error blocking slot: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to block slot"));
        }
    }

    @PostMapping("/unblock-slot")
    public ResponseEntity<?> unblockSlot(@RequestBody Map<String, String> request) {
        try {
            String dateStr = request.get("date");
            String slot = request.get("slot");
            LocalDate date = LocalDate.parse(dateStr);

            logger.info("Unblocking slot {} on {}", slot, date);
            availabilityService.unblockSlot(date, slot);

            return ResponseEntity.ok(Map.of("message", "Slot unblocked successfully"));
        } catch (Exception e) {
            logger.error("Error unblocking slot: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to unblock slot"));
        }
    }

    @PostMapping("/cancel-booking")
    public ResponseEntity<?> cancelBooking(@RequestBody Map<String, String> request) {
        try {
            String bookingId = request.get("bookingId");
            String reason = request.get("reason");

            logger.info("Cancelling booking {} with reason: {}", bookingId, reason);

            Booking booking = bookingRepository.findByBookingId(bookingId);
            if (booking == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Booking not found"));
            }

            adminService.cancelBooking(bookingId);

            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully"));
        } catch (Exception e) {
            logger.error("Error cancelling booking: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel booking"));
        }
    }

    @GetMapping("/booking-details/{date}/{slot}")
    public ResponseEntity<?> getBookingDetails(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable String slot) {
        try {
            logger.info("Getting booking details for date: {} and slot: {}", date, slot);

            List<Booking> bookings = bookingRepository.findByAppointmentTimeBetween(
                    date.atTime(LocalTime.parse(slot, TimeSlotUtil.TIME_FMT)),
                    date.atTime(LocalTime.parse(slot, TimeSlotUtil.TIME_FMT).plusHours(1))
            );

            if (bookings.isEmpty()) {
                return ResponseEntity.ok(Map.of("booking", null));
            }

            Booking booking = bookings.get(0);
            Map<String, Object> bookingDetails = new HashMap<>();
            bookingDetails.put("bookingId", booking.getBookingId());
            bookingDetails.put("customerName", booking.getName());
            bookingDetails.put("customerEmail", booking.getEmail());
            bookingDetails.put("customerPhone", booking.getPhone());
            bookingDetails.put("serviceType", booking.getServiceType());
            bookingDetails.put("vehicleType", booking.getVehicleType());
            bookingDetails.put("address", booking.getAddress());
            bookingDetails.put("addons", booking.getAddons());
            bookingDetails.put("paymentMethod", booking.getPaymentMethod());
            bookingDetails.put("status", booking.getStatus());
            bookingDetails.put("appointmentTime", booking.getAppointmentTime());

            return ResponseEntity.ok(Map.of("booking", bookingDetails));
        } catch (Exception e) {
            logger.error("Error getting booking details for date {} and slot {}: {}", date, slot, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get booking details"));
        }
    }

    @GetMapping("/current-slots/{bookingId}")
    public ResponseEntity<?> getCurrentSlotsByBookingId(@PathVariable String bookingId) {
    try {
        logger.info("Getting current slots for booking: {}", bookingId);

        List<String> occupiedSlots = availabilityService.getCurrentSlotsByBookingId(bookingId);

        return ResponseEntity.ok(Map.of("currentSlots", occupiedSlots));
    } catch (Exception e) {
        logger.error("Error getting current slots for booking {}: {}", bookingId, e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get current slots"));
    }
}
} 
