package com.detailing.repository;

import com.detailing.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class BookingRepository {

    private final DynamoDbEnhancedClient enhancedClient;
    private final String tableName;
    private DynamoDbTable<Booking> bookingTable;

    @Autowired
    public BookingRepository(DynamoDbEnhancedClient enhancedClient, 
                             @Value("${dynamodb.table-name.bookings}") String tableName) {
        this.enhancedClient = enhancedClient;
        this.tableName = tableName;
    }

    @PostConstruct
    public void init() {
        this.bookingTable = enhancedClient.table(tableName, TableSchema.fromBean(Booking.class));
    }

    public Booking save(Booking booking) {
        bookingTable.putItem(booking);
        return booking;
    }

    public Booking findById(String bookingId) {
        return bookingTable.getItem(r -> r.key(k -> k.partitionValue(bookingId)));
    }
    
    public List<Booking> findAll() {
        return bookingTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .collect(Collectors.toList());
    }
    
    public List<Booking> findByStatus(Booking.BookingStatus status) {
        
        return bookingTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .filter(booking -> status.equals(booking.getStatus()))
                .collect(Collectors.toList());
    }
    
    public long countByStatus(Booking.BookingStatus status) {
        return findByStatus(status).size();
    }
    
    public long countAll() {
        return findAll().size();
    }
    
    public void delete(String bookingId) {
        bookingTable.deleteItem(r -> r.key(k -> k.partitionValue(bookingId)));
    }
    
    public Booking findByBookingId(String bookingId) {
        return findById(bookingId);
    }
    
    public List<Booking> findByAppointmentTimeBetween(java.time.LocalDateTime start, java.time.LocalDateTime end) {
        return bookingTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .filter(booking -> booking.getAppointmentTime() != null && 
                         !booking.getAppointmentTime().isBefore(start) && 
                         booking.getAppointmentTime().isBefore(end))
                .collect(Collectors.toList());
    }
    
    public List<Booking> findByStatusInAndAppointmentTimeBefore(List<Booking.BookingStatus> statuses, java.time.LocalDateTime dateTime) {
        return bookingTable.scan(ScanEnhancedRequest.builder().build())
                .items()
                .stream()
                .filter(booking -> statuses.contains(booking.getStatus()) && booking.getAppointmentTime() != null && booking.getAppointmentTime().isBefore(dateTime))
                .collect(Collectors.toList());
    }
} 
