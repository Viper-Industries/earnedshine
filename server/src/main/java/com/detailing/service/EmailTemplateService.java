package com.detailing.service;

import com.detailing.model.Booking;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
public class EmailTemplateService {

    public String generateBookingConfirmationPlainText(Booking booking) {
        StringBuilder sb = new StringBuilder();
        sb.append("BOOKING CONFIRMATION\n");
        sb.append("====================\n\n");
        sb.append("Thank you for booking with Earned Shine Detailing!\n\n");
        sb.append("BOOKING DETAILS:\n");
        sb.append("Booking ID: ").append(booking.getBookingId()).append("\n");
        sb.append("Name: ").append(booking.getName()).append("\n");
        sb.append("Email: ").append(booking.getEmail()).append("\n");
        sb.append("Phone: ").append(booking.getPhone()).append("\n");
        sb.append("Service Address: ").append(booking.getAddress()).append("\n");
        sb.append("Vehicle Type: ").append(formatVehicleType(booking.getVehicleType())).append("\n");
        sb.append("Service Type: ").append(formatServiceType(booking.getServiceType())).append("\n");
        
        if (booking.getAddons() != null && !booking.getAddons().isEmpty()) {
            sb.append("Add-ons: ");
            for (int i = 0; i < booking.getAddons().size(); i++) {
                if (i > 0) sb.append(", ");
                sb.append(formatAddonName(booking.getAddons().get(i)));
            }
            sb.append("\n");
        }
        
        sb.append("Appointment Time: ").append(formatAppointmentTime(booking.getAppointmentTime())).append("\n");
        sb.append("Payment Method: ").append(formatPaymentMethod(booking.getPaymentMethod())).append("\n");
        sb.append("Status: ").append(formatStatus(booking.getStatus())).append("\n\n");
        
        sb.append("We'll see you soon!\n\n");
        sb.append("Best regards,\n");
        sb.append("Earned Shine Detailing Team");
        
        return sb.toString();
    }

    public String generateBookingConfirmationEmail(Booking booking) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='UTF-8'><title>Booking Confirmation</title></head>");
        html.append("<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>");
        
        html.append("<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>");
        html.append("<h1 style='margin: 0; font-size: 28px;'>Booking Confirmed!</h1>");
        html.append("<p style='margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;'>Thank you for choosing Earned Shine Detailing</p>");
        html.append("</div>");
        
        html.append("<div style='background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;'>");
        html.append("<h2 style='color: #495057; margin-top: 0;'>Booking Details</h2>");
        
        html.append("<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>");
        html.append(detail("Booking ID", booking.getBookingId()));
        html.append(detail("Name", booking.getName()));
        html.append(detail("Email", booking.getEmail()));
        html.append(detail("Phone", booking.getPhone()));
        html.append(detail("Service Address", booking.getAddress()));
        html.append(detail("Vehicle Type", formatVehicleType(booking.getVehicleType())));
        html.append(detail("Service Type", formatServiceType(booking.getServiceType())));
        
        if (booking.getAddons() != null && !booking.getAddons().isEmpty()) {
            StringBuilder addons = new StringBuilder();
            for (int i = 0; i < booking.getAddons().size(); i++) {
                if (i > 0) addons.append(", ");
                addons.append(formatAddonName(booking.getAddons().get(i)));
            }
            html.append(detail("Add-ons", addons.toString()));
        }
        
        html.append(detail("Appointment Time", formatAppointmentTime(booking.getAppointmentTime())));
        html.append(detail("Payment Method", formatPaymentMethod(booking.getPaymentMethod())));
        html.append(detail("Status", formatStatus(booking.getStatus())));
        html.append("</table>");
        
        html.append("<div style='background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;'>");
        html.append("<p style='margin: 0; color: #495057;'><strong>We're excited to detail your vehicle!</strong></p>");
        html.append("<p style='margin: 10px 0 0 0; color: #6c757d;'>Our team will arrive at your location at the scheduled time. If you have any questions, please don't hesitate to contact us.</p>");
        html.append("</div>");
        
        html.append("<p style='text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px;'>");
        html.append("Best regards,<br><strong>Earned Shine Detailing Team</strong>");
        html.append("</p>");
        
        html.append("</div>");
        html.append("</body></html>");
        
        return html.toString();
    }

    public String generateAdminBookingNotificationPlainText(Booking booking) {
        StringBuilder sb = new StringBuilder();
        sb.append("NEW BOOKING RECEIVED\n");
        sb.append("====================\n\n");
        sb.append("A new booking has been received through the website.\n\n");
        sb.append("BOOKING DETAILS:\n");
        sb.append("Booking ID: ").append(booking.getBookingId()).append("\n");
        sb.append("Customer Name: ").append(booking.getName()).append("\n");
        sb.append("Email: ").append(booking.getEmail()).append("\n");
        sb.append("Phone: ").append(booking.getPhone()).append("\n");
        sb.append("Service Address: ").append(booking.getAddress()).append("\n");
        sb.append("Vehicle Type: ").append(formatVehicleType(booking.getVehicleType())).append("\n");
        sb.append("Service Type: ").append(formatServiceType(booking.getServiceType())).append("\n");
        
        if (booking.getAddons() != null && !booking.getAddons().isEmpty()) {
            sb.append("Add-ons: ");
            for (int i = 0; i < booking.getAddons().size(); i++) {
                if (i > 0) sb.append(", ");
                sb.append(formatAddonName(booking.getAddons().get(i)));
            }
            sb.append("\n");
        }
        
        sb.append("Appointment Time: ").append(formatAppointmentTime(booking.getAppointmentTime())).append("\n");
        sb.append("Payment Method: ").append(formatPaymentMethod(booking.getPaymentMethod())).append("\n");
        sb.append("Status: ").append(formatStatus(booking.getStatus())).append("\n\n");
        
        sb.append("Please review and confirm this booking in the admin panel.");
        
        return sb.toString();
    }

    public String generateAdminBookingNotificationEmail(Booking booking) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html>");
        html.append("<html><head><meta charset='UTF-8'><title>New Booking Notification</title></head>");
        html.append("<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>");
        
        html.append("<div style='background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>");
        html.append("<h1 style='margin: 0; font-size: 28px;'>New Booking Received!</h1>");
        html.append("<p style='margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;'>A customer has made a new booking</p>");
        html.append("</div>");
        
        html.append("<div style='background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;'>");
        html.append("<h2 style='color: #495057; margin-top: 0;'>Booking Details</h2>");
        
        html.append("<table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>");
        html.append(detail("Booking ID", booking.getBookingId()));
        html.append(detail("Customer Name", booking.getName()));
        html.append(detail("Email", booking.getEmail()));
        html.append(detail("Phone", booking.getPhone()));
        html.append(detail("Service Address", booking.getAddress()));
        html.append(detail("Vehicle Type", formatVehicleType(booking.getVehicleType())));
        html.append(detail("Service Type", formatServiceType(booking.getServiceType())));
        
        if (booking.getAddons() != null && !booking.getAddons().isEmpty()) {
            StringBuilder addons = new StringBuilder();
            for (int i = 0; i < booking.getAddons().size(); i++) {
                if (i > 0) addons.append(", ");
                addons.append(formatAddonName(booking.getAddons().get(i)));
            }
            html.append(detail("Add-ons", addons.toString()));
        }
        
        html.append(detail("Appointment Time", formatAppointmentTime(booking.getAppointmentTime())));
        html.append(detail("Payment Method", formatPaymentMethod(booking.getPaymentMethod())));
        html.append(detail("Status", formatStatus(booking.getStatus())));
        html.append("</table>");
        
        html.append("</div>");
        html.append("</body></html>");
        
        return html.toString();
    }

    private String detail(String label, String value) {
        return "<tr><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #495057;'>" + label + ":</td><td style='padding: 8px 0; border-bottom: 1px solid #dee2e6; color: #6c757d;'>" + value + "</td></tr>";
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

    private String formatPaymentMethod(Booking.PaymentMethod pm) {
        return pm == Booking.PaymentMethod.ONLINE ? "Online Payment" : "Pay in Person";
    }

    private String formatStatus(Booking.BookingStatus status) {
        switch (status) {
            case PENDING_PAYMENT: return "Pending Payment";
            case CONFIRMED: return "Confirmed";
            case COMPLETED: return "Completed";
            case CANCELED_BY_USER: return "Cancelled by User";
            case CANCELED_BY_ADMIN: return "Cancelled by Admin";
            default: return status.toString();
        }
    }

    private String formatStatus(String raw) {
        return formatStatus(Booking.BookingStatus.valueOf(raw.toUpperCase()));
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

    private String formatAppointmentTime(java.time.LocalDateTime appointmentTime) {
        if (appointmentTime == null) {
            return "Not specified";
        }
        
        ZonedDateTime zonedDateTime = appointmentTime.atZone(ZoneId.systemDefault());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");
        return zonedDateTime.format(formatter);
    }
} 
