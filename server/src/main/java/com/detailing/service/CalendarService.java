package com.detailing.service;

import com.detailing.model.Booking;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

@Service
public class CalendarService {

    public String generateCalendarInvite(Booking booking) {
        if (booking.getAppointmentTime() == null) {
            return "";
        }

        ZonedDateTime startTime = booking.getAppointmentTime().atZone(ZoneId.systemDefault());
        ZonedDateTime endTime = startTime.plusHours(2);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'");
        String startTimeFormatted = startTime.withZoneSameInstant(ZoneId.of("UTC")).format(formatter);
        String endTimeFormatted = endTime.withZoneSameInstant(ZoneId.of("UTC")).format(formatter);
        String nowFormatted = ZonedDateTime.now(ZoneId.of("UTC")).format(formatter);

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//Earned Shine Detailing//Car Detailing Appointment//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:REQUEST\r\n");
        ics.append("BEGIN:VEVENT\r\n");
        ics.append("UID:").append(booking.getBookingId()).append("@earnedshine.com\r\n");
        ics.append("DTSTAMP:").append(nowFormatted).append("\r\n");
        ics.append("DTSTART:").append(startTimeFormatted).append("\r\n");
        ics.append("DTEND:").append(endTimeFormatted).append("\r\n");
        ics.append("SUMMARY:Car Detailing Appointment - ").append(formatServiceType(booking.getServiceType())).append("\r\n");
        
        StringBuilder description = new StringBuilder();
        description.append("Car detailing appointment with Earned Shine Detailing\\n\\n");
        description.append("Service: ").append(formatServiceType(booking.getServiceType())).append("\\n");
        description.append("Vehicle: ").append(formatVehicleType(booking.getVehicleType())).append("\\n");
        description.append("Location: ").append(booking.getAddress()).append("\\n");
        description.append("Booking ID: ").append(booking.getBookingId()).append("\\n");
        
        if (booking.getAddons() != null && !booking.getAddons().isEmpty()) {
            description.append("Add-ons: ");
            for (int i = 0; i < booking.getAddons().size(); i++) {
                if (i > 0) description.append(", ");
                description.append(formatAddonName(booking.getAddons().get(i)));
            }
            description.append("\\n");
        }
        
        ics.append("DESCRIPTION:").append(description.toString()).append("\r\n");
        ics.append("LOCATION:").append(booking.getAddress()).append("\r\n");
        ics.append("STATUS:CONFIRMED\r\n");
        ics.append("SEQUENCE:0\r\n");
        ics.append("BEGIN:VALARM\r\n");
        ics.append("TRIGGER:-PT1H\r\n");
        ics.append("DESCRIPTION:Car detailing appointment in 1 hour\r\n");
        ics.append("ACTION:DISPLAY\r\n");
        ics.append("END:VALARM\r\n");
        ics.append("END:VEVENT\r\n");
        ics.append("END:VCALENDAR\r\n");

        return ics.toString();
    }

    private String formatServiceType(String serviceType) {
        return toTitleCase(serviceType.replace("_", " "));
    }

    private String formatVehicleType(String vehicleType) {
        switch (vehicleType.toLowerCase()) {
            case "sedan": return "Sedan/Coupe";
            case "suv": return "SUV/Minivan";
            case "truck": return "Truck";
            case "motorcycle": return "Motorcycle";
            default: return toTitleCase(vehicleType);
        }
    }

    private String formatAddonName(String addonId) {
        return toTitleCase(addonId.replace("_", " "));
    }

    private String toTitleCase(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        
        String[] words = input.split("\\s+");
        StringBuilder titleCase = new StringBuilder();
        
        for (String word : words) {
            if (word.length() > 0) {
                titleCase.append(Character.toUpperCase(word.charAt(0)))
                         .append(word.substring(1).toLowerCase())
                         .append(" ");
            }
        }
        
        return titleCase.toString().trim();
    }
} 
