package com.detailing.service;

import com.detailing.model.Availability;
import com.detailing.repository.AvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.IntStream;
import com.detailing.util.TimeSlotUtil;

@Service
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final ServiceConfigurationService serviceConfigurationService;
    private static final DateTimeFormatter DATE_FORMATTER = TimeSlotUtil.DATE_FMT;
    private static final DateTimeFormatter TIME_FORMATTER = TimeSlotUtil.TIME_FMT;

    @Autowired
    public AvailabilityService(AvailabilityRepository availabilityRepository,
                              ServiceConfigurationService serviceConfigurationService) {
        this.availabilityRepository = availabilityRepository;
        this.serviceConfigurationService = serviceConfigurationService;
    }

    private boolean isSlotAvailable(LocalDate date, LocalTime time, String excludeBookingId) {
        String dateStr = date.format(DATE_FORMATTER);
        String timeStr = time.format(TIME_FORMATTER);
        return availabilityRepository.isSlotAvailable(dateStr, timeStr, excludeBookingId);
    }

    public boolean isSlotAvailable(LocalDate date, LocalTime time) {
        return isSlotAvailable(date, time, null);
    }
    
    public boolean isSlotAvailable(LocalDateTime when) {
        return isSlotAvailable(when.toLocalDate(), when.toLocalTime(), null);
    }
    
    public boolean isSlotAvailable(LocalDateTime when, String excludeBookingId) {
        return isSlotAvailable(when.toLocalDate(), when.toLocalTime(), excludeBookingId);
    }

    public boolean isSlotAvailable(String date, String slot) {
        return isSlotAvailable(TimeSlotUtil.parseDate(date), TimeSlotUtil.parseTime(slot), null);
    }

    public boolean isSlotAvailable(String date, String slot, String excludeBookingId) {
        return isSlotAvailable(TimeSlotUtil.parseDate(date), TimeSlotUtil.parseTime(slot), excludeBookingId);
    }

    public boolean isSlotAvailable(LocalDate date, String slot) {
        return isSlotAvailable(date, TimeSlotUtil.parseTime(slot), null);
    }

    public boolean isSlotAvailable(LocalDate date, String slot, String excludeBookingId) {
        return isSlotAvailable(date, TimeSlotUtil.parseTime(slot), excludeBookingId);
    }

    @Transactional
    public void bookSlot(LocalDate date, LocalTime time, String bookingId) {
        Availability availability = new Availability();
        availability.setDate(date.format(DATE_FORMATTER));
        availability.setSlot(time.format(TIME_FORMATTER));
        availability.setStatus(Availability.AvailabilityStatus.BOOKED);
        availability.setReason("customer_booking");
        availability.setBookingId(bookingId);
        availabilityRepository.save(availability);
    }

    public void bookSlot(LocalDateTime dateTime, String bookingId) {
        bookSlot(dateTime.toLocalDate(), dateTime.toLocalTime(), bookingId);
    }

    public void bookSlot(String date, String slot, String bookingId) {
        bookSlot(TimeSlotUtil.parseDate(date), TimeSlotUtil.parseTime(slot), bookingId);
    }

    public void bookSlot(LocalDate date, String slot, String bookingId) {
        bookSlot(date, TimeSlotUtil.parseTime(slot), bookingId);
    }

    @Transactional
    public void blockSlot(LocalDate date, LocalTime time, String reason) {
        Availability availability = new Availability();
        availability.setDate(date.format(DATE_FORMATTER));
        availability.setSlot(time.format(TIME_FORMATTER));
        availability.setStatus(Availability.AvailabilityStatus.BLOCKED);
        availability.setReason(reason);
        availabilityRepository.save(availability);
    }

    public void blockDay(LocalDate date, String reason) {
        Availability availability = new Availability();
        availability.setDate(date.format(DATE_FORMATTER));
        availability.setSlot("ALL_DAY");
        availability.setStatus(Availability.AvailabilityStatus.BLOCKED);
        availability.setReason(reason);
        availabilityRepository.save(availability);
    }

    public void blockSlot(String date, String slot, String reason) {
        blockSlot(TimeSlotUtil.parseDate(date), TimeSlotUtil.parseTime(slot), reason);
    }

    public void blockSlot(LocalDate date, String slot, String reason) {
        blockSlot(date, TimeSlotUtil.parseTime(slot), reason);
    }

    public void blockDay(String date, String reason) {
        blockDay(TimeSlotUtil.parseDate(date), reason);
    }

    @Transactional
    public void unblockSlot(LocalDate date, LocalTime time) {
        String dateStr = date.format(DATE_FORMATTER);
        String timeStr = time.format(TIME_FORMATTER);
        availabilityRepository.deleteByDateAndSlot(dateStr, timeStr);
    }

    public void unblockDay(LocalDate date) {
        String dateStr = date.format(DATE_FORMATTER);
        availabilityRepository.deleteByDateAndSlot(dateStr, "ALL_DAY");
    }

    public void unblockSlot(String date, String slot) {
        unblockSlot(TimeSlotUtil.parseDate(date), TimeSlotUtil.parseTime(slot));
    }

    public void unblockSlot(LocalDate date, String slot) {
        unblockSlot(date, TimeSlotUtil.parseTime(slot));
    }

    public void unblockDay(String date) {
        unblockDay(TimeSlotUtil.parseDate(date));
    }

    @Transactional
    public void cancelBooking(LocalDate date, LocalTime time) {
        String dateStr = date.format(DATE_FORMATTER);
        String timeStr = time.format(TIME_FORMATTER);
        availabilityRepository.deleteByDateAndSlot(dateStr, timeStr);
    }

    public void cancelBooking(LocalDateTime dateTime, String bookingId) {
        cancelBooking(dateTime.toLocalDate(), dateTime.toLocalTime());
    }

    public void cancelBooking(String date, String slot) {
        cancelBooking(TimeSlotUtil.parseDate(date), TimeSlotUtil.parseTime(slot));
    }

    public void cancelBooking(LocalDate date, String slot) {
        cancelBooking(date, TimeSlotUtil.parseTime(slot));
    }

    public List<Availability> getAvailabilityForDate(LocalDate date) {
        return availabilityRepository.findByDate(date.format(DATE_FORMATTER));
    }

    public List<Availability> getAvailabilityForDate(String date) {
        return getAvailabilityForDate(TimeSlotUtil.parseDate(date));
    }

    public List<Availability> getAvailableSlotsForDate(LocalDate date) {
        return availabilityRepository.findAvailableSlotsByDate(date.format(DATE_FORMATTER));
    }

    public List<Availability> getAvailableSlotsForDate(String date) {
        return getAvailableSlotsForDate(TimeSlotUtil.parseDate(date));
    }

    public boolean isDayBlocked(LocalDate date) {
        String dateStr = date.format(DATE_FORMATTER);
        Availability allDaySlot = availabilityRepository.findByDateAndSlot(dateStr, "ALL_DAY");
        return allDaySlot != null && !allDaySlot.isAvailable();
    }

    public boolean isDayBlocked(String date) {
        return isDayBlocked(TimeSlotUtil.parseDate(date));
    }

    @Transactional
    public void bookServiceSlots(LocalDateTime startDateTime, String serviceType, String bookingId) {
        int durationMinutes = serviceConfigurationService.getServiceDurationMinutes(serviceType);
        List<String> slotsToBook = calculateRequiredSlots(startDateTime, durationMinutes);
        
        String date = startDateTime.format(DATE_FORMATTER);
        for (String slot : slotsToBook) {
            bookSlot(date, slot, bookingId);
        }
    }
    
    @Transactional
    public void cancelServiceSlots(LocalDateTime startDateTime, String serviceType, String bookingId) {
        int durationMinutes = serviceConfigurationService.getServiceDurationMinutes(serviceType);
        List<String> slotsToCancel = calculateRequiredSlots(startDateTime, durationMinutes);
        
        String date = startDateTime.format(DATE_FORMATTER);
        for (String slot : slotsToCancel) {
            cancelBooking(date, slot);
        }
    }
    
    public boolean areServiceSlotsAvailable(LocalDateTime startDateTime, String serviceType) {
        return areServiceSlotsAvailable(startDateTime, serviceType, null);
    }
    
    public boolean areServiceSlotsAvailable(LocalDateTime startDateTime, String serviceType, String excludeBookingId) {
        int durationMinutes = serviceConfigurationService.getServiceDurationMinutes(serviceType);
        List<String> requiredSlots = calculateRequiredSlots(startDateTime, durationMinutes);
        
        String date = startDateTime.format(DATE_FORMATTER);
        for (String slot : requiredSlots) {
            if (!isSlotAvailable(date, slot, excludeBookingId)) {
                return false;
            }
        }
        return true;
    }
    
    private List<String> calculateRequiredSlots(LocalDateTime startDateTime, int durationMinutes) {
        List<String> requiredSlots = new ArrayList<>();
        LocalTime startTime = startDateTime.toLocalTime();
        String startSlot = startTime.format(TIME_FORMATTER);
        
        int startIndex = TimeSlotUtil.WORKING_HOURS.indexOf(startSlot);
        if (startIndex == -1) {
            throw new IllegalArgumentException("Invalid start time: " + startSlot);
        }
        
        int slotsNeeded = (int) Math.ceil(durationMinutes / 60.0);
        
        for (int i = 0; i < slotsNeeded && (startIndex + i) < TimeSlotUtil.WORKING_HOURS.size(); i++) {
            requiredSlots.add(TimeSlotUtil.WORKING_HOURS.get(startIndex + i));
        }
        
        return requiredSlots;
    }
    
    public List<String> getCurrentSlotsByBookingId(String bookingId) {
        return availabilityRepository.findSlotsByBookingId(bookingId);
    }

    public List<String> findStartSlots(LocalDate date, String serviceType, String excludeBookingId){
        int minutes = serviceType == null || serviceType.isEmpty() ? 60 : serviceConfigurationService.getServiceDurationMinutes(serviceType);
        int needed = (int)Math.ceil(minutes / 60.0);

        List<String> result = new ArrayList<>();
        for(int i=0;i<= TimeSlotUtil.WORKING_HOURS.size()-needed;i++){
            final int currentIndex = i;
            boolean free = IntStream.range(0,needed)
                    .allMatch(j -> isSlotAvailable(date, TimeSlotUtil.WORKING_HOURS.get(currentIndex+j), excludeBookingId));
            if(free){
                result.add(TimeSlotUtil.WORKING_HOURS.get(currentIndex));
            }
        }
        return result;
    }
} 
