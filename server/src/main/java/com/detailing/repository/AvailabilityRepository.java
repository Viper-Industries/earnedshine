package com.detailing.repository;

import com.detailing.model.Availability;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryEnhancedRequest;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class AvailabilityRepository {

    private final DynamoDbTable<Availability> availabilityTable;

    @Autowired
    public AvailabilityRepository(DynamoDbEnhancedClient dynamoDbEnhancedClient) {
        this.availabilityTable = dynamoDbEnhancedClient.table("availability", TableSchema.fromBean(Availability.class));
    }

    public void save(Availability availability) {
        availabilityTable.putItem(availability);
    }

    public Availability findByDateAndSlot(String date, String slot) {
        Key key = Key.builder()
                .partitionValue(date)
                .sortValue(slot)
                .build();
        return availabilityTable.getItem(key);
    }

    public List<Availability> findByDate(String date) {
        QueryConditional queryConditional = QueryConditional.keyEqualTo(
                Key.builder().partitionValue(date).build()
        );

        QueryEnhancedRequest queryRequest = QueryEnhancedRequest.builder()
                .queryConditional(queryConditional)
                .build();

        return availabilityTable.query(queryRequest)
                .items()
                .stream()
                .collect(Collectors.toList());
    }

    public List<Availability> findAvailableSlotsByDate(String date) {
        return findByDate(date)
                .stream()
                .filter(Availability::isAvailable)
                .collect(Collectors.toList());
    }

    public boolean isSlotAvailable(String date, String slot) {
        
        Availability allDaySlot = findByDateAndSlot(date, "ALL_DAY");
        if (allDaySlot != null && !allDaySlot.isAvailable()) {
            return false;
        }
        
        Availability specificSlot = findByDateAndSlot(date, slot);
        return specificSlot == null || specificSlot.isAvailable();
    }

    public boolean isSlotAvailable(String date, String slot, String excludeBookingId) {
        
        Availability allDaySlot = findByDateAndSlot(date, "ALL_DAY");
        if (allDaySlot != null && !allDaySlot.isAvailable()) {
            return false;
        }
        
        Availability specificSlot = findByDateAndSlot(date, slot);
        if (specificSlot == null) {
            return true; 
        }
        
        if (specificSlot.isAvailable()) {
            return true;
        }
        
        if (specificSlot.isBooked() && excludeBookingId != null && 
            excludeBookingId.equals(specificSlot.getBookingId())) {
            return true;
        }
        
        return false;
    }

    public void deleteByDateAndSlot(String date, String slot) {
        Key key = Key.builder()
                .partitionValue(date)
                .sortValue(slot)
                .build();
        availabilityTable.deleteItem(key);
    }

    public void deleteByDate(String date) {
        List<Availability> slotsToDelete = findByDate(date);
        for (Availability availability : slotsToDelete) {
            deleteByDateAndSlot(availability.getDate(), availability.getSlot());
        }
    }

    public List<Availability> findByBookingId(String bookingId) {
        return availabilityTable.scan()
                .items()
                .stream()
                .filter(availability -> bookingId.equals(availability.getBookingId()))
                .collect(Collectors.toList());
    }
    
    public List<String> findSlotsByBookingId(String bookingId) {
        return findByBookingId(bookingId)
                .stream()
                .map(Availability::getSlot)
                .collect(Collectors.toList());
    }
} 
