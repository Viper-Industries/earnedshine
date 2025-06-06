export interface AdminStats {
    totalBookings?: number;
    pendingBookings?: number;
    confirmedBookings?: number;
    completedBookings?: number;
    canceledByUser?: number;
    canceledByAdmin?: number;
    totalRevenue?: number;
    error?: string;
    message?: string; 
}

export interface Booking {
    bookingId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    vehicleType: string;
    serviceType: string;
    addons: string[];
    appointmentTime: string;
    paymentMethod: 'ONLINE' | 'IN_PERSON';
    status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED_BY_USER' | 'CANCELED_BY_ADMIN' | 'HIDDEN';
    createdAt: string;
    hidden?: boolean; 
}

export interface Availability {
    date: string;
    slot: string;
    status: 'AVAILABLE' | 'BLOCKED' | 'BOOKED';
    reason?: string;
    bookingId?: string;
}

export interface BookingDetails {
    bookingId: string;
    name: string;
    phone: string;
    address: string;
    vehicleType: string;
    serviceType: string;
    serviceName: string;
    appointmentTime: string;
    paymentMethod: string;
    status: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    durationHours: number;
}
