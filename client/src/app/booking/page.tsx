'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SERVICES } from '@/lib/services';
import { CustomerInfoForm } from '@/components/booking/customer-info-form';
import { ServiceSelection } from '@/components/booking/service-selection';
import { AppointmentScheduler } from '@/components/booking/appointment-scheduler';
import { AddonSelection } from '@/components/booking/addon-selection';
import { BookingSummary } from '@/components/booking/booking-summary';

interface BookingFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    vehicleType: string;
    serviceType: string;
    addons: string[];
    appointmentDate: Date | undefined;
    appointmentTime: string;
    paymentMethod: 'ONLINE' | 'IN_PERSON';
}

interface BookingResponse {
    bookingId: string;
}

interface StripeCheckoutResponse {
    checkoutUrl: string;
    sessionId: string;
}

interface AvailabilityResponse {
    availableSlots: string[];
}

export default function BookingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [formData, setFormData] = useState<BookingFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        vehicleType: 'sedan',
        serviceType: '',
        addons: [],
        appointmentDate: undefined,
        appointmentTime: '',
        paymentMethod: 'IN_PERSON'
    });

    useEffect(() => {
        const serviceParam = searchParams.get('service');
        let selectedServiceType = SERVICES[0].id;

        if (serviceParam) {
            const serviceExists = SERVICES.find(service => service.id === serviceParam);
            if (serviceExists) {
                selectedServiceType = serviceParam;
            }
        }

        setFormData(prev => ({
            ...prev,
            serviceType: selectedServiceType
        }));
    }, [searchParams]);

    const fetchAvailableSlots = useCallback(
        async (date: Date, serviceType: string) => {
            setLoadingSlots(true);
            setError(null);

            try {
                const dateStr = format(date, 'yyyy-MM-dd');
                const response = await fetch(`/api/availability/slots/${dateStr}?serviceType=${serviceType}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch available slots');
                }

                const data: AvailabilityResponse = await response.json();
                setAvailableSlots(data.availableSlots);

                if (formData.appointmentTime && !data.availableSlots.includes(formData.appointmentTime)) {
                    setFormData(prev => ({ ...prev, appointmentTime: '' }));
                }
            } catch (err) {
                console.error('Error fetching available slots:', err);
                setError('Failed to load available time slots. Please try again.');
                setAvailableSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        },
        [formData.appointmentTime]
    );

    useEffect(() => {
        if (formData.appointmentDate && formData.serviceType) {
            fetchAvailableSlots(formData.appointmentDate, formData.serviceType);
        } else {
            setAvailableSlots([]);
        }
    }, [formData.appointmentDate, formData.serviceType, fetchAvailableSlots]);

    const handleInputChange = (field: keyof BookingFormData, value: string | Date | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddonToggle = (addonId: string) => {
        setFormData(prev => ({
            ...prev,
            addons: prev.addons.includes(addonId) ? prev.addons.filter(id => id !== addonId) : [...prev.addons, addonId]
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.vehicleType || !formData.serviceType || !formData.appointmentDate || !formData.appointmentTime) {
                throw new Error('Please fill in all required fields');
            }

            const [hours, minutes] = formData.appointmentTime.split(':');
            const appointmentDateTime = new Date(formData.appointmentDate);
            appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const year = appointmentDateTime.getFullYear();
            const month = String(appointmentDateTime.getMonth() + 1).padStart(2, '0');
            const day = String(appointmentDateTime.getDate()).padStart(2, '0');
            const hour = String(appointmentDateTime.getHours()).padStart(2, '0');
            const minute = String(appointmentDateTime.getMinutes()).padStart(2, '0');
            const second = '00';
            const appointmentTimeString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

            const bookingPayload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                vehicleType: formData.vehicleType,
                serviceType: formData.serviceType,
                addons: formData.addons,
                appointmentTime: appointmentTimeString,
                paymentMethod: formData.paymentMethod
            };

            console.log('Submitting booking:', bookingPayload);

            const bookingResponse = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingPayload)
            });

            if (!bookingResponse.ok) {
                const errorData = await bookingResponse.json();
                throw new Error(errorData.message || 'Failed to create booking');
            }

            const { bookingId }: BookingResponse = await bookingResponse.json();
            console.log('Booking created with ID:', bookingId);

            if (formData.paymentMethod === 'ONLINE') {
                console.log('Creating Stripe checkout session...');

                const stripeResponse = await fetch('/api/stripe/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ bookingId })
                });

                if (!stripeResponse.ok) {
                    const errorData = await stripeResponse.json();
                    throw new Error(errorData.error || 'Failed to create payment session');
                }

                const { checkoutUrl }: StripeCheckoutResponse = await stripeResponse.json();
                console.log('Redirecting to Stripe checkout:', checkoutUrl);

                window.location.href = checkoutUrl;
            } else {
                router.push(`/success?bookingId=${bookingId}&payment=in_person`);
            }
        } catch (err) {
            console.error('Booking submission error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <Card className="shadow-xl">
                    <CardContent className="p-8 -mt-5 lg:p-12">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="space-y-10">
                                    <CustomerInfoForm
                                        formData={{
                                            name: formData.name,
                                            email: formData.email,
                                            phone: formData.phone,
                                            address: formData.address,
                                            vehicleType: formData.vehicleType
                                        }}
                                        onInputChange={handleInputChange}
                                    />

                                    <ServiceSelection serviceType={formData.serviceType} onServiceChange={value => handleInputChange('serviceType', value)} />

                                    <AppointmentScheduler appointmentDate={formData.appointmentDate} appointmentTime={formData.appointmentTime} availableSlots={availableSlots} loadingSlots={loadingSlots} onDateChange={date => handleInputChange('appointmentDate', date)} onTimeChange={time => handleInputChange('appointmentTime', time)} />
                                </div>

                                <div className="space-y-8">
                                    <AddonSelection selectedAddons={formData.addons} onAddonToggle={handleAddonToggle} />
                                </div>
                            </div>

                            <BookingSummary serviceType={formData.serviceType} selectedAddons={formData.addons} paymentMethod={formData.paymentMethod} isLoading={isLoading} loadingSlots={loadingSlots} availableSlots={availableSlots} onPaymentMethodChange={value => handleInputChange('paymentMethod', value)} />

                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-destructive text-sm">{error}</p>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
