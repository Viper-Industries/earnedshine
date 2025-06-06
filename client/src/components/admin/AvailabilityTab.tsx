'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Ban, Check, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BookingStatusBadge } from './BookingStatusBadge';
import { TIME_SLOTS, formatTimeSlot } from '@/lib/admin-utils';
import { Availability, BookingDetails } from '@/types/admin';
import { getServiceById } from '@/lib/services';

export function AvailabilityTab() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [blockDayDialogOpen, setBlockDayDialogOpen] = useState(false);
    const [cancelBookingDialogOpen, setCancelBookingDialogOpen] = useState(false);
    const [selectedBookingSlot, setSelectedBookingSlot] = useState<string>('');
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [loadingBookingDetails, setLoadingBookingDetails] = useState(false);

    useEffect(() => {
        fetchAvailability();
    }, [selectedDate]);

    const fetchAvailability = async () => {
        setLoading(true);
        setError(null);

        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const response = await fetch(`/api/availability/${dateStr}`);

            if (!response.ok) {
                throw new Error('Failed to fetch availability');
            }

            const data: Availability[] = await response.json();
            setAvailability(data);
        } catch (err) {
            console.error('Error fetching availability:', err);
            setError('Failed to load availability data');
            setAvailability([]);
        } finally {
            setLoading(false);
        }
    };

    const blockDay = async () => {
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const response = await fetch('/api/availability/block-day', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr, reason: 'admin_blocked' })
            });

            if (!response.ok) {
                throw new Error('Failed to block day');
            }

            setBlockDayDialogOpen(false);
            fetchAvailability();
        } catch (err) {
            console.error('Error blocking day:', err);
            setError('Failed to block day');
        }
    };

    const unblockDay = async () => {
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const response = await fetch('/api/availability/unblock-day', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr })
            });

            if (!response.ok) {
                throw new Error('Failed to unblock day');
            }

            fetchAvailability();
        } catch (err) {
            console.error('Error unblocking day:', err);
            setError('Failed to unblock day');
        }
    };

    const toggleSlot = async (slot: string) => {
        const slotData = getSlotData(slot);
        const status = slotData?.status;

        if (status === 'BOOKED') {
            setSelectedBookingSlot(slot);
            setCancelBookingDialogOpen(true);
            fetchBookingDetails(slot);
            return;
        }

        const isBlocked = status === 'BLOCKED';

        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');

            if (isBlocked) {
                
                const response = await fetch('/api/availability/unblock-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date: dateStr, slot })
                });

                if (!response.ok) {
                    throw new Error('Failed to unblock slot');
                }
            } else {
                const response = await fetch('/api/availability/block-slot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        date: dateStr,
                        slot,
                        reason: 'admin_blocked'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to block slot');
                }
            }

            fetchAvailability();
        } catch (err) {
            console.error('Error toggling slot:', err);
            setError('Failed to update slot');
        }
    };

    const cancelBooking = async () => {
        if (!bookingDetails || !bookingDetails.bookingId) {
            setError('Booking ID is missing, cannot cancel.');
            return;
        }
        try {
            const response = await fetch('/api/availability/cancel-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: bookingDetails.bookingId, reason: 'Cancelled by admin via availability tab' })
            });

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

            setCancelBookingDialogOpen(false);
            setSelectedBookingSlot('');
            setBookingDetails(null);
            fetchAvailability();
        } catch (err) {
            console.error('Error canceling booking:', err);
            setError('Failed to cancel booking');
        }
    };

    const getSlotStatus = (slot: string) => {
        const slotData = availability.find(a => a.slot === slot);
        return slotData?.status || 'AVAILABLE';
    };

    const getSlotData = (slot: string) => {
        return availability.find(a => a.slot === slot);
    };

    const isDayBlocked = availability.some(a => a.slot === 'ALL_DAY' && a.status === 'BLOCKED');
    const today = new Date();

    const fetchBookingDetails = async (slot: string) => {
        setLoadingBookingDetails(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const response = await fetch(`/api/availability/booking-details/${dateStr}/${slot}`);

            if (!response.ok) {
                throw new Error('Failed to fetch booking details');
            }

            const responseData = await response.json();
            if (!responseData.booking) {
                throw new Error('Booking data not found in response');
            }
            const rawDetails = responseData.booking;

            
            const serviceDefinition = getServiceById(rawDetails.serviceType);

            const details: BookingDetails = {
                bookingId: rawDetails.bookingId,
                name: rawDetails.customerName,
                phone: rawDetails.customerPhone,
                address: rawDetails.address,
                vehicleType: rawDetails.vehicleType,
                serviceType: rawDetails.serviceType,
                serviceName: serviceDefinition ? serviceDefinition.name : rawDetails.serviceType,
                appointmentTime: rawDetails.appointmentTime,
                paymentMethod: rawDetails.paymentMethod,
                status: rawDetails.status,
                startTime: format(new Date(rawDetails.appointmentTime), 'HH:mm'),
                endTime: serviceDefinition ? format(new Date(new Date(rawDetails.appointmentTime).getTime() + serviceDefinition.durationMinutes * 60000), 'HH:mm') : format(new Date(rawDetails.appointmentTime), 'HH:mm'),
                durationMinutes: serviceDefinition ? serviceDefinition.durationMinutes : 0,
                durationHours: serviceDefinition ? serviceDefinition.durationHours : 0
            };
            setBookingDetails(details);
        } catch (err) {
            console.error('Error fetching booking details:', err);
            setError('Failed to load booking details');
            setBookingDetails(null);
        } finally {
            setLoadingBookingDetails(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="mb-2">Manage Availability</CardTitle>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn('justify-start text-left font-normal w-[240px]', !selectedDate && 'text-muted-foreground')}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={selectedDate} onSelect={date => date && setSelectedDate(date)} disabled={date => date < today} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                {isDayBlocked && <Badge variant="destructive">Day Blocked</Badge>}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {isDayBlocked ? (
                                <Button onClick={unblockDay} variant="outline">
                                    <Check className="w-4 h-4 mr-2" />
                                    Unblock Day
                                </Button>
                            ) : (
                                <Dialog open={blockDayDialogOpen} onOpenChange={setBlockDayDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="destructive">
                                            <Ban className="w-4 h-4 mr-2" />
                                            Block Entire Day
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Block Day</DialogTitle>
                                            <DialogDescription>Block the entire day of {format(selectedDate, 'PPP')}? This will make all time slots unavailable for booking.</DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setBlockDayDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button variant="destructive" onClick={blockDay}>
                                                Block Day
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </div>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-destructive text-sm">{error}</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="p-3 rounded-lg border-2 text-center">
                                    <Skeleton className="h-4 w-16 mx-auto mb-2" />
                                    <Skeleton className="h-6 w-20 mx-auto mb-1 rounded-full" />
                                    <Skeleton className="h-3 w-12 mx-auto" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                            {TIME_SLOTS.map(slot => {
                                const status = getSlotStatus(slot);
                                const slotData = getSlotData(slot);
                                const isClickable = !isDayBlocked;

                                return (
                                    <div key={slot} className={cn('p-3 rounded-lg border-2 text-center transition-all', status === 'AVAILABLE' && 'border-green-500/20 bg-green-500/10', status === 'BLOCKED' && 'border-red-500/20 bg-red-500/10', status === 'BOOKED' && 'border-blue-500/20 bg-blue-500/10', isDayBlocked && 'opacity-50', isClickable && 'cursor-pointer hover:scale-105 hover:shadow-md', !isClickable && 'cursor-not-allowed')} onClick={() => isClickable && toggleSlot(slot)}>
                                        <div className="font-medium text-sm">{formatTimeSlot(slot)}</div>
                                        <div className="mt-1">
                                            <BookingStatusBadge status={status} type="availability" />
                                        </div>
                                        {slotData?.reason && slotData.reason !== 'customer_booking' && slotData.reason !== 'admin_blocked' && <div className="text-xs text-muted-foreground mt-1 truncate">{slotData.reason}</div>}
                                        {isClickable && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {status === 'AVAILABLE' && 'Click to block'}
                                                {status === 'BLOCKED' && 'Click to unblock'}
                                                {status === 'BOOKED' && 'Click to cancel'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={cancelBookingDialogOpen}
                onOpenChange={open => {
                    setCancelBookingDialogOpen(open);
                    if (!open) {
                        setBookingDetails(null);
                        setSelectedBookingSlot('');
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Cancel Customer Booking
                        </DialogTitle>
                        <DialogDescription asChild>
                            <div>
                                {loadingBookingDetails ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                                        Loading booking details...
                                    </div>
                                ) : bookingDetails ? (
                                    <div>
                                        Booking ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{bookingDetails.bookingId}</code>
                                    </div>
                                ) : (
                                    <p>
                                        Are you sure you want to cancel the customer booking for <strong>{formatTimeSlot(selectedBookingSlot)}</strong> on {format(selectedDate, 'PPP')}?
                                    </p>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    {bookingDetails && (
                        <div className="space-y-4">
                            <p>Are you sure you want to cancel this customer booking?</p>

                            <div className="p-4 rounded-lg border space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-semibold text-muted-foreground">Status:</span>
                                        <p className="text-sm">{bookingDetails.status}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-muted-foreground">Payment:</span>
                                        <p className="text-sm">{bookingDetails.paymentMethod}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-semibold text-muted-foreground">Customer:</span>
                                        <p className="text-sm">{bookingDetails.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-muted-foreground">Phone:</span>
                                        <p className="text-sm">{bookingDetails.phone}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm font-semibold text-muted-foreground">Vehicle:</span>
                                        <p className="text-sm">{bookingDetails.vehicleType}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm font-semibold text-muted-foreground">Service Address:</span>
                                        <p className="text-sm">{bookingDetails.address}</p>
                                    </div>
                                </div>

                                <div className="grid grid-1">
                                    <div>
                                        <span className="text-sm font-semibold text-muted-foreground">Service:</span>
                                        <p className="text-sm font-medium">{bookingDetails.serviceName}</p>
                                    </div>
                                </div>

                                <div className="bg-blue-500/10 p-3 rounded border border-blue-500/20">
                                    <span className="text-sm font-semibold text-blue-400">Appointment Time:</span>
                                    <p className="text-sm text-blue-300">
                                        {format(new Date(bookingDetails.appointmentTime), 'PPP')} at {formatTimeSlot(bookingDetails.startTime)} to {formatTimeSlot(bookingDetails.endTime)}
                                    </p>
                                    <p className="text-xs text-blue-400">
                                        Duration: {bookingDetails.durationHours} hour{bookingDetails.durationHours > 1 ? 's' : ''} ({bookingDetails.durationMinutes} minutes)
                                    </p>
                                </div>
                            </div>

                            <div className="bg-amber-500/10 p-3 rounded border border-amber-500/20">
                                <p className="text-sm text-amber-400">
                                    <span className="font-semibold">Warning:</span> This will cancel the customers appointment and make the slot(s) available for new bookings. The customer should be notified separately.
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCancelBookingDialogOpen(false);
                                setBookingDetails(null);
                                setSelectedBookingSlot('');
                            }}
                        >
                            Keep Booking
                        </Button>
                        <Button variant="destructive" onClick={cancelBooking} disabled={loadingBookingDetails}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel Booking
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
