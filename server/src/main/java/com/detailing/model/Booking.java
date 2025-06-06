package com.detailing.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@DynamoDbBean
public class Booking {

    private String bookingId;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String vehicleType;
    private String serviceType;
    private List<String> addons;
    private LocalDateTime appointmentTime;
    private PaymentMethod paymentMethod;
    private BookingStatus status;
    private String stripeCustomerId;
    private String stripeSessionId;
    private Instant createdAt;
    private boolean hidden = false;

    @DynamoDbPartitionKey
    @DynamoDbAttribute("booking_id")
    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public List<String> getAddons() {
        return addons;
    }

    public void setAddons(List<String> addons) {
        this.addons = addons;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = "GSI-ByAppointment")
    @DynamoDbSecondarySortKey(indexNames = "GSI-ByStatus")
    public LocalDateTime getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(LocalDateTime appointmentTime) {
        this.appointmentTime = appointmentTime;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    @DynamoDbSecondarySortKey(indexNames = "GSI-ByAppointment")
    @DynamoDbSecondaryPartitionKey(indexNames = "GSI-ByStatus")
    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getStripeCustomerId() {
        return stripeCustomerId;
    }

    public void setStripeCustomerId(String stripeCustomerId) {
        this.stripeCustomerId = stripeCustomerId;
    }

    public String getStripeSessionId() {
        return stripeSessionId;
    }

    public void setStripeSessionId(String stripeSessionId) {
        this.stripeSessionId = stripeSessionId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public enum PaymentMethod {
        ONLINE,
        IN_PERSON
    }

    public enum BookingStatus {
        PENDING_PAYMENT,
        CONFIRMED,
        COMPLETED,
        CANCELED_BY_USER,
        CANCELED_BY_ADMIN
    }
} 
