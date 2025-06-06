import { formatServiceName } from './services';

export const formatServiceType = (serviceType: string) => {
    return formatServiceName(serviceType);
};

export const formatVehicleType = (vehicleType: string) => {
    switch (vehicleType) {
        case 'sedan':
            return 'Sedan/Coupe';
        case 'suv':
            return 'SUV/Minivan';
        case 'truck':
            return 'Truck';
        case 'motorcycle':
            return 'Motorcycle';
        default:
            return vehicleType;
    }
};

export const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
};

export const formatTimeSlot = (time: string) => {
    try {
        return new Date(`1970-01-01T${time}:00`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return time;
    }
};

export const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

export const getCurrentTime = (appointmentTime: string) => {
    try {
        return appointmentTime.split('T')[1]?.substring(0, 5) || '08:00';
    } catch {
        return '08:00';
    }
};

export const formatAddonName = (addon: string) => {
    return addon.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

export const fetcher = (url: string) =>
    fetch(url).then(res => {
        if (!res.ok) {
            throw new Error('Failed to fetch data');
        }
        return res.json();
    });
