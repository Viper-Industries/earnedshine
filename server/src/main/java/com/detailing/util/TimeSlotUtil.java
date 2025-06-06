package com.detailing.util;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public final class TimeSlotUtil {
    public static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    public static final List<String> WORKING_HOURS = List.of(
            "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00", "17:00", "18:00");

    public static LocalDate parseDate(String s) {
        return LocalDate.parse(s, DATE_FMT);
    }
    
    public static LocalTime parseTime(String s) {
        return LocalTime.parse(s, TIME_FMT);
    }

    private TimeSlotUtil() {
    }
} 
