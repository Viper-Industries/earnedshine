package com.detailing.service;

import com.detailing.model.Booking;
import com.detailing.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AvailabilityService availabilityService;
    private final GmailService gmailService;

    @Autowired
    public BookingService(BookingRepository bookingRepository, AvailabilityService availabilityService, GmailService gmailService) {
        this.bookingRepository = bookingRepository;
        this.availabilityService = availabilityService;
        this.gmailService = gmailService;
    }

    public Booking createBooking(Booking bookingDetails) throws IllegalStateException {
        
        LocalDateTime appointmentTime = bookingDetails.getAppointmentTime();
        String serviceType = bookingDetails.getServiceType();

        if (!availabilityService.areServiceSlotsAvailable(appointmentTime, serviceType)) {
            throw new IllegalStateException("Selected time slot is not available for the requested service duration");
        }

        bookingDetails.setBookingId(UUID.randomUUID().toString());
        bookingDetails.setCreatedAt(Instant.now());

        bookingDetails.setStatus(Booking.BookingStatus.PENDING_PAYMENT);
        
        bookingRepository.save(bookingDetails);

        availabilityService.bookServiceSlots(appointmentTime, serviceType, bookingDetails.getBookingId());

        try {
            gmailService.sendBookingConfirmation(bookingDetails);
        } catch (Exception e) {
            
            System.err.println("Failed to send booking confirmation email for booking " + bookingDetails.getBookingId() + ": " + e.getMessage());
        }

        return bookingDetails;
    }

    public Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId);
    }
    
    public java.util.List<Booking> getAllBookings(boolean includeHidden) {
        
        autoUpdatePastAppointments();
        
        java.util.List<Booking> allBookings = bookingRepository.findAll();
        if (includeHidden) {
            return allBookings;
        } else {
            
            return allBookings.stream()
                    .filter(booking -> !booking.isHidden())
                    .collect(java.util.stream.Collectors.toList());
        }
    }
    
    private void autoUpdatePastAppointments() {
        
        java.util.List<Booking> confirmedBookings = bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED);
        LocalDateTime now = LocalDateTime.now();
        
        for (Booking booking : confirmedBookings) {
            
            if (booking.getAppointmentTime().isBefore(now)) {
                booking.setStatus(Booking.BookingStatus.COMPLETED);
                bookingRepository.save(booking);
            }
        }
    }
    
    public Booking updateBooking(Booking booking) {
        
        Booking existingBooking = getBookingById(booking.getBookingId());
        String previousStatus = existingBooking != null ? existingBooking.getStatus().toString() : null;
        
        bookingRepository.save(booking);
        
        if (existingBooking != null && !existingBooking.getStatus().equals(booking.getStatus())) {
            try {
                gmailService.sendBookingStatusUpdate(booking, previousStatus);
            } catch (Exception e) {
                
                System.err.println("Failed to send booking status update email for booking " + booking.getBookingId() + ": " + e.getMessage());
            }
        }
        
        return booking;
    }

    public void cancelBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);
        if (booking != null) {
            
            booking.setStatus(Booking.BookingStatus.CANCELED_BY_USER);
            updateBooking(booking);

            LocalDateTime appointmentTime = booking.getAppointmentTime();
            String serviceType = booking.getServiceType();
            availabilityService.cancelServiceSlots(appointmentTime, serviceType, bookingId);
        }
    }
    
    public int hideCanceledBookings() {
        java.util.List<Booking> canceledBookings = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.CANCELED_BY_USER || 
                                 booking.getStatus() == Booking.BookingStatus.CANCELED_BY_ADMIN)
                .filter(booking -> !booking.isHidden()) 
                .collect(java.util.stream.Collectors.toList());
        
        for (Booking booking : canceledBookings) {
            booking.setHidden(true);
            bookingRepository.save(booking);
        }
        
        return canceledBookings.size();
    }
    
} 
