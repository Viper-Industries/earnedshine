package com.detailing.service;

import com.detailing.model.Booking;
import com.detailing.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final BookingRepository bookingRepository;
    private final AvailabilityService availabilityService;
    private final ServiceConfigurationService serviceConfigurationService;
    private final PricingService pricingService;

    @Autowired
    public AdminService(BookingRepository bookingRepository, 
                       AvailabilityService availabilityService,
                       ServiceConfigurationService serviceConfigurationService,
                       PricingService pricingService) {
        this.bookingRepository = bookingRepository;
        this.availabilityService = availabilityService;
        this.serviceConfigurationService = serviceConfigurationService;
        this.pricingService = pricingService;
    }

    public Map<String, Object> getBookingStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            autoUpdatePastAppointments();
            
            long totalBookings = bookingRepository.countAll();
            long pendingBookings = bookingRepository.countByStatus(Booking.BookingStatus.PENDING_PAYMENT);
            long confirmedBookings = bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED);
            long completedBookings = bookingRepository.countByStatus(Booking.BookingStatus.COMPLETED);
            long canceledByUser = bookingRepository.countByStatus(Booking.BookingStatus.CANCELED_BY_USER);
            long canceledByAdmin = bookingRepository.countByStatus(Booking.BookingStatus.CANCELED_BY_ADMIN);
            
            double totalRevenue = calculateTotalRevenue();
            
            stats.put("totalBookings", totalBookings);
            stats.put("pendingBookings", pendingBookings);
            stats.put("confirmedBookings", confirmedBookings);
            stats.put("completedBookings", completedBookings);
            stats.put("canceledByUser", canceledByUser);
            stats.put("canceledByAdmin", canceledByAdmin);
            stats.put("totalRevenue", totalRevenue);
        } catch (Exception e) {
            stats.put("error", "Failed to fetch booking statistics: " + e.getMessage());
        }
        
        return stats;
    }
    
    private void autoUpdatePastAppointments() {
        
        LocalDateTime now = LocalDateTime.now();
        List<Booking.BookingStatus> statusesToUpdate = java.util.Arrays.asList(
            Booking.BookingStatus.CONFIRMED, 
            Booking.BookingStatus.PENDING_PAYMENT
        );
        
        List<Booking> bookingsToUpdate = bookingRepository.findByStatusInAndAppointmentTimeBefore(statusesToUpdate, now);
        
        for (Booking booking : bookingsToUpdate) {
            booking.setStatus(Booking.BookingStatus.COMPLETED);
            availabilityService.cancelServiceSlots(booking.getAppointmentTime(), booking.getServiceType(), booking.getBookingId());
            bookingRepository.save(booking);
        }
    }
    
    private double calculateTotalRevenue() {
        
        List<Booking> completedBookings = bookingRepository.findByStatus(Booking.BookingStatus.COMPLETED);
        List<Booking> confirmedBookings = bookingRepository.findByStatus(Booking.BookingStatus.CONFIRMED);
        
        double revenue = 0.0;
        
        for (Booking booking : completedBookings) {
            int totalPriceCents = pricingService.calculateTotalPrice(booking.getServiceType(), booking.getAddons());
            revenue += totalPriceCents / 100.0; 
        }
        
        for (Booking booking : confirmedBookings) {
            int totalPriceCents = pricingService.calculateTotalPrice(booking.getServiceType(), booking.getAddons());
            revenue += totalPriceCents / 100.0; 
        }
        
        return revenue;
    }
    
    public List<Booking> getAllBookings() {
        
        autoUpdatePastAppointments();
        return bookingRepository.findAll();
    }
    
    public List<Booking> getAllBookings(boolean includeHidden) {
        
        autoUpdatePastAppointments();
        
        List<Booking> allBookings = bookingRepository.findAll();
        if (includeHidden) {
            return allBookings;
        } else {
            
            return allBookings.stream()
                    .filter(booking -> booking.isHidden() == false)
                    .collect(java.util.stream.Collectors.toList());
        }
    }
    
    public List<Booking> getBookingsByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public Booking updateBooking(String bookingId, Booking updatedBooking) {
        Booking existingBooking = bookingRepository.findById(bookingId);
        if (existingBooking == null) {
            throw new RuntimeException("Booking not found with ID: " + bookingId);
        }

        Booking.BookingStatus originalStatus = existingBooking.getStatus();
        LocalDateTime originalTime = existingBooking.getAppointmentTime();
        String originalServiceType = existingBooking.getServiceType();
        LocalDateTime newTime = updatedBooking.getAppointmentTime();
        String newServiceType = updatedBooking.getServiceType();
        
        boolean timeChanged = !originalTime.equals(newTime);
        boolean serviceTypeChanged = !originalServiceType.equals(newServiceType);
        Booking.BookingStatus newStatus = updatedBooking.getStatus();
        
        if ((timeChanged || serviceTypeChanged) && 
            (newStatus == Booking.BookingStatus.CONFIRMED || newStatus == Booking.BookingStatus.PENDING_PAYMENT)) {
            
            boolean shouldCheckAvailability = (originalStatus == Booking.BookingStatus.CONFIRMED || 
                                             originalStatus == Booking.BookingStatus.PENDING_PAYMENT ||
                                             originalStatus == Booking.BookingStatus.COMPLETED ||
                                             originalStatus == Booking.BookingStatus.CANCELED_BY_ADMIN ||
                                             originalStatus == Booking.BookingStatus.CANCELED_BY_USER);
            
            if (shouldCheckAvailability && !availabilityService.areServiceSlotsAvailable(newTime, newServiceType, bookingId)) {
                throw new RuntimeException("The selected time slot is not available for the requested service duration");
            }
        }
        
        existingBooking.setName(updatedBooking.getName());
        existingBooking.setPhone(updatedBooking.getPhone());
        existingBooking.setAddress(updatedBooking.getAddress());
        existingBooking.setVehicleType(updatedBooking.getVehicleType());
        existingBooking.setServiceType(updatedBooking.getServiceType());
        existingBooking.setAddons(updatedBooking.getAddons());
        existingBooking.setPaymentMethod(updatedBooking.getPaymentMethod());
        existingBooking.setStatus(updatedBooking.getStatus());
        existingBooking.setAppointmentTime(newTime);
        existingBooking.setHidden(updatedBooking.isHidden());
        
        handleBookingUpdate(existingBooking, originalStatus, originalTime, originalServiceType, timeChanged, serviceTypeChanged);
        
        return bookingRepository.save(existingBooking);
    }

    public void cancelBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found with ID: " + bookingId);
        }

        Booking.BookingStatus originalStatus = booking.getStatus();
        booking.setStatus(Booking.BookingStatus.CANCELED_BY_ADMIN);
        
        if (originalStatus == Booking.BookingStatus.CONFIRMED || 
            originalStatus == Booking.BookingStatus.PENDING_PAYMENT) {
            availabilityService.cancelServiceSlots(booking.getAppointmentTime(), booking.getServiceType(), bookingId);
        }
        
        bookingRepository.save(booking);
    }

    private void handleBookingUpdate(Booking booking, Booking.BookingStatus originalStatus, 
                                   LocalDateTime originalTime, String originalServiceType, boolean timeChanged, boolean serviceTypeChanged) {
        Booking.BookingStatus newStatus = booking.getStatus();
        LocalDateTime newTime = booking.getAppointmentTime();
        String bookingId = booking.getBookingId();
        String newServiceType = booking.getServiceType();
        
        if ((timeChanged || serviceTypeChanged) && (originalStatus == Booking.BookingStatus.CONFIRMED || 
                           originalStatus == Booking.BookingStatus.PENDING_PAYMENT)) {
            
            if (newStatus == Booking.BookingStatus.CONFIRMED || 
                newStatus == Booking.BookingStatus.PENDING_PAYMENT) {
                
                availabilityService.cancelServiceSlots(originalTime, originalServiceType, bookingId);
                availabilityService.bookServiceSlots(newTime, newServiceType, bookingId);
            } else {
                
                availabilityService.cancelServiceSlots(originalTime, originalServiceType, bookingId);
            }
        }
        
        else if (!timeChanged && !serviceTypeChanged) {
            handleBookingStatusChange(booking, originalStatus, originalTime, originalServiceType);
        }
        
        else if ((timeChanged || serviceTypeChanged) && (originalStatus == Booking.BookingStatus.CANCELED_BY_ADMIN || 
                                originalStatus == Booking.BookingStatus.CANCELED_BY_USER)) {
            
            if (newStatus == Booking.BookingStatus.CONFIRMED || 
                newStatus == Booking.BookingStatus.PENDING_PAYMENT) {
                availabilityService.bookServiceSlots(newTime, newServiceType, bookingId);
            }
        }
        
        else if ((timeChanged || serviceTypeChanged) && originalStatus == Booking.BookingStatus.COMPLETED) {
            
            if (newStatus == Booking.BookingStatus.CONFIRMED || 
                newStatus == Booking.BookingStatus.PENDING_PAYMENT) {
                availabilityService.bookServiceSlots(newTime, newServiceType, bookingId);
            }
            
        }
    }

    private void handleBookingStatusChange(Booking booking, Booking.BookingStatus originalStatus, LocalDateTime originalTime, String originalServiceType) {
        Booking.BookingStatus newStatus = booking.getStatus();
        String newServiceType = booking.getServiceType();
        
        if ((originalStatus == Booking.BookingStatus.CONFIRMED || originalStatus == Booking.BookingStatus.PENDING_PAYMENT) &&
            (newStatus == Booking.BookingStatus.CANCELED_BY_ADMIN || newStatus == Booking.BookingStatus.CANCELED_BY_USER)) {
            availabilityService.cancelServiceSlots(originalTime, originalServiceType, booking.getBookingId());
        }
        
        if ((originalStatus == Booking.BookingStatus.CANCELED_BY_ADMIN || originalStatus == Booking.BookingStatus.CANCELED_BY_USER) &&
            (newStatus == Booking.BookingStatus.CONFIRMED || newStatus == Booking.BookingStatus.PENDING_PAYMENT)) {
            availabilityService.bookServiceSlots(booking.getAppointmentTime(), newServiceType, booking.getBookingId());
        }
        
        if ((originalStatus == Booking.BookingStatus.CONFIRMED || originalStatus == Booking.BookingStatus.PENDING_PAYMENT) &&
            newStatus == Booking.BookingStatus.COMPLETED) {
            availabilityService.cancelServiceSlots(originalTime, originalServiceType, booking.getBookingId());
        }
        
        if (originalStatus == Booking.BookingStatus.COMPLETED &&
            (newStatus == Booking.BookingStatus.CONFIRMED || newStatus == Booking.BookingStatus.PENDING_PAYMENT)) {
            availabilityService.bookServiceSlots(booking.getAppointmentTime(), newServiceType, booking.getBookingId());
        }
        
    }

    public void hideBooking(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId);
        if (booking == null) {
            throw new RuntimeException("Booking not found with ID: " + bookingId);
        }
        
        booking.setHidden(true);
        bookingRepository.save(booking);
    }
    
    public int hideCompletedAndCanceledBookings() {
        List<Booking> bookingsToHide = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() == Booking.BookingStatus.CANCELED_BY_USER || 
                                 booking.getStatus() == Booking.BookingStatus.CANCELED_BY_ADMIN ||
                                 booking.getStatus() == Booking.BookingStatus.COMPLETED)
                .filter(booking -> booking.isHidden() == false) 
                .collect(java.util.stream.Collectors.toList());
        
        for (Booking booking : bookingsToHide) {
            booking.setHidden(true);
            bookingRepository.save(booking);
        }
        
        return bookingsToHide.size();
    }
} 
