package com.detailing.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PricingService {

    private static final Map<String, Integer> SERVICE_PRICES = new HashMap<>();
    static {
        SERVICE_PRICES.put("basic_shine", 6000);
        SERVICE_PRICES.put("full_interior", 9000);
        SERVICE_PRICES.put("earned_signature", 13000);
    }

    private static final Map<String, Integer> ADDON_PRICES = new HashMap<>();
    static {
        ADDON_PRICES.put("clay_bar_treatment", 4000);
        ADDON_PRICES.put("headlight_restoration", 3000);
        ADDON_PRICES.put("high_gloss_tire_dressing", 1000);
        ADDON_PRICES.put("windshield_rain_repellent", 1500);
        
        ADDON_PRICES.put("pet_hair_removal", 2000);
        ADDON_PRICES.put("ozone_odor_treatment", 3000);
        ADDON_PRICES.put("stain_extraction", 1000);
        
        ADDON_PRICES.put("engine_bay_deep_cleaning", 3000);
        ADDON_PRICES.put("scratch_paint_touch_up", 5000);
    }

    public int calculateTotalPrice(String serviceType, List<String> addons) {
        int total = SERVICE_PRICES.getOrDefault(serviceType, 0);
        
        if (addons != null) {
            for (String addon : addons) {
                total += ADDON_PRICES.getOrDefault(addon, 0);
            }
        }
        
        return total;
    }

    public int getServicePrice(String serviceType) {
        return SERVICE_PRICES.getOrDefault(serviceType, 0);
    }

    public int getAddonPrice(String addonId) {
        return ADDON_PRICES.getOrDefault(addonId, 0);
    }
} 
