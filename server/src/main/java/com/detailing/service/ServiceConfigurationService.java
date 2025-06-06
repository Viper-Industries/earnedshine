package com.detailing.service;

import com.detailing.model.ServiceDefinition;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class ServiceConfigurationService {

    private static final List<ServiceDefinition> SERVICES = Arrays.asList(
        new ServiceDefinition(
            "basic_shine",
            "Basic Shine Package",
            "Essential car cleaning with exterior wash and basic interior cleaning",
            60.0,
            60,
            1
        ),
        new ServiceDefinition(
            "full_interior",
            "Full Interior Shine",
            "Complete interior detailing including deep cleaning, vacuuming, and conditioning",
            90.0,
            120,
            2
        ),
        new ServiceDefinition(
            "earned_signature",
            "Earned Shine Signature Package",
            "Premium full-service detailing with exterior wash, wax, interior deep clean, and protection",
            130.0,
            180,
            3
        )
    );

    public List<ServiceDefinition> getAllServices() {
        return SERVICES;
    }

    public Optional<ServiceDefinition> getServiceById(String serviceId) {
        return SERVICES.stream()
            .filter(service -> service.getId().equals(serviceId))
            .findFirst();
    }

    public double getServicePrice(String serviceId) {
        return getServiceById(serviceId)
            .map(ServiceDefinition::getPrice)
            .orElse(0.0);
    }

    public int getServiceDurationMinutes(String serviceId) {
        return getServiceById(serviceId)
            .map(ServiceDefinition::getDurationMinutes)
            .orElse(60); 
    }

    public String getServiceName(String serviceId) {
        return getServiceById(serviceId)
            .map(ServiceDefinition::getName)
            .orElse(serviceId);
    }

    public boolean isValidServiceId(String serviceId) {
        return getServiceById(serviceId).isPresent();
    }
} 
