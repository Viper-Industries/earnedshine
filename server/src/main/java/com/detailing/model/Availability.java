package com.detailing.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbAttribute;

@DynamoDbBean
public class Availability {

    private String date; 
    private String slot; 
    private AvailabilityStatus status;
    private String reason;
    private String bookingId;

    @DynamoDbPartitionKey
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    @DynamoDbSortKey
    public String getSlot() {
        return slot;
    }

    public void setSlot(String slot) {
        this.slot = slot;
    }

    public AvailabilityStatus getStatus() {
        return status;
    }

    public void setStatus(AvailabilityStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    @DynamoDbAttribute("booking_id")
    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public enum AvailabilityStatus {
        AVAILABLE,
        BLOCKED,
        BOOKED
    }

    public boolean isAllDay() {
        return "ALL_DAY".equals(slot);
    }

    public boolean isAvailable() {
        return status == AvailabilityStatus.AVAILABLE;
    }

    public boolean isBlocked() {
        return status == AvailabilityStatus.BLOCKED;
    }

    public boolean isBooked() {
        return status == AvailabilityStatus.BOOKED;
    }
} 
