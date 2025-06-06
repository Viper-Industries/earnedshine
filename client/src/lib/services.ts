export interface ServiceDefinition {
    id: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    durationHours: number;
}

export interface AddonDefinition {
    id: string;
    name: string;
    description: string;
    price: number;
}

export const SERVICES: ServiceDefinition[] = [
    {
        id: 'basic_shine',
        name: 'Basic Shine Package',
        description: 'Perfect for routine maintenance or quick refresh. Hand wash & foam bath, wheel & tire cleaning + shine, interior vacuum, light interior wipe down, windows (inside & out), finishing spray wax.',
        price: 60,
        durationMinutes: 60,
        durationHours: 1
    },
    {
        id: 'full_interior',
        name: 'Full Interior Shine',
        description: 'Deep clean for the inside of your ride. Full interior vacuum (carpet, seats, trunk), deep steam cleaning (floors, mats, cloth seats), leather/plastic conditioning, cupholders, vents, door panels detailed.',
        price: 90,
        durationMinutes: 120,
        durationHours: 2
    },
    {
        id: 'earned_signature',
        name: 'The Earned Shine Signature Package',
        description: 'Our full interior & exterior transformation. Includes everything in both full interior & exterior packages, ceramic sealant upgrade, engine bay light wipe-down (optional), high-gloss finish.',
        price: 130,
        durationMinutes: 180,
        durationHours: 3
    }
];

export const ADDONS: AddonDefinition[] = [
    {
        id: 'clay_bar_treatment',
        name: 'Clay Bar Treatment',
        description: 'Removes bonded contaminants for a smooth-as-glass finish',
        price: 40
    },
    {
        id: 'headlight_restoration',
        name: 'Headlight Restoration',
        description: 'Clears foggy or yellowed headlights for safer, sharper lighting',
        price: 30
    },
    {
        id: 'high_gloss_tire_dressing',
        name: 'High-Gloss Tire Dressing',
        description: 'Gives tires that deep, clean showroom shine',
        price: 10
    },
    {
        id: 'windshield_rain_repellent',
        name: 'Windshield Rain Repellent Coating',
        description: 'Enhances visibility during rain and helps water bead off',
        price: 15
    },
    {
        id: 'pet_hair_removal',
        name: 'Pet Hair Removal',
        description: 'Specialized tools to get stubborn pet hair out of seats and carpet',
        price: 20
    },
    {
        id: 'ozone_odor_treatment',
        name: 'Ozone Odor Treatment',
        description: 'Neutralizes smoke, food, or pet odors — not just masks them',
        price: 30
    },
    {
        id: 'stain_extraction',
        name: 'Stain Extraction (Per Seat/Area)',
        description: 'Spot treatment for tough spills or built-up stains',
        price: 10
    },
    {
        id: 'engine_bay_deep_cleaning',
        name: 'Engine Bay Deep Cleaning',
        description: 'Degreased and detailed — perfect for resale or shows',
        price: 30
    },
    {
        id: 'scratch_paint_touch_up',
        name: 'Scratch & Paint Touch-Up',
        description: 'Light scratches or minor paint blemishes touched up on-site',
        price: 0
    }
];

export const getServiceById = (serviceId: string): ServiceDefinition | undefined => {
    return SERVICES.find(service => service.id === serviceId);
};

export const getAddonById = (addonId: string): AddonDefinition | undefined => {
    return ADDONS.find(addon => addon.id === addonId);
};

export const getServicePrice = (serviceId: string): number => {
    const service = getServiceById(serviceId);
    return service ? service.price : 0;
};

export const getAddonPrice = (addonId: string): number => {
    const addon = getAddonById(addonId);
    return addon ? addon.price : 0;
};

export const getServiceDuration = (serviceId: string): number => {
    const service = getServiceById(serviceId);
    return service ? service.durationMinutes : 60;
};

export const formatServiceName = (serviceId: string): string => {
    const service = getServiceById(serviceId);
    return service ? service.name : serviceId;
};

export const formatServiceWithPrice = (serviceId: string): string => {
    const service = getServiceById(serviceId);
    return service ? `${service.name} - $${service.price}` : serviceId;
};
