'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from './StatCard';
import { BookingEditDialog } from './BookingEditDialog';
import { BookingsTable } from './BookingsTable';
import { fetcher, getCurrentDate, getCurrentTime } from '@/lib/admin-utils';
import { AdminStats, Booking } from '@/types/admin';

export function OverviewTab() {
    const { data: stats, error: statsError, isLoading: statsLoading } = useSWR<AdminStats>('/api/admin/stats', fetcher);
    const { data: bookings, error: bookingsError, isLoading: bookingsLoading, mutate: mutateBookings } = useSWR<Booking[]>('/api/admin/bookings', fetcher);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [editForm, setEditForm] = useState<Booking | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    const [isCanceling, setIsCanceling] = useState(false);
    const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
    const [isCleaningUp, setIsCleaningUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRowClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setEditForm({ ...booking });
        setEditDialogOpen(true);
        
        loadAvailableSlots(booking.appointmentTime.split('T')[0], booking.serviceType, booking.bookingId);
    };

    const handleEditFormChange = (field: keyof Booking, value: string | boolean | string[]) => {
        if (editForm) {
            const newEditForm = { ...editForm, [field]: value };
            setEditForm(newEditForm);

            if (field === 'serviceType' && typeof value === 'string') {
                const currentDate = editForm.appointmentTime.split('T')[0];
                loadAvailableSlots(currentDate, value, editForm.bookingId);
            }
        }
    };

    const handleDateChange = (date: string) => {
        if (editForm) {
            const currentTime = editForm.appointmentTime.split('T')[1] || '08:00:00';
            const newDateTime = `${date}T${currentTime}`;
            setEditForm({ ...editForm, appointmentTime: newDateTime });
            loadAvailableSlots(date, editForm.serviceType, editForm.bookingId);
        }
    };

    const handleTimeChange = (time: string) => {
        if (editForm) {
            const currentDate = editForm.appointmentTime.split('T')[0];
            const newDateTime = `${currentDate}T${time}:00`;
            setEditForm({ ...editForm, appointmentTime: newDateTime });
        }
    };

    const loadAvailableSlots = async (date: string, serviceType?: string, excludeBookingId?: string) => {
        setLoadingSlots(true);
        try {
            let url = `/api/availability/slots/${date}`;
            const params = new URLSearchParams();

            if (serviceType) {
                params.append('serviceType', serviceType);
            }
            if (excludeBookingId) {
                params.append('excludeBookingId', excludeBookingId);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setAvailableSlots(data.availableSlots || []);
            } else {
                console.error('Failed to load available slots');
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error('Error loading available slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleUpdateBooking = async () => {
        if (!editForm) return;

        setIsUpdating(true);
        setError(null);

        try {
            console.log('Updating booking with addons:', editForm.addons);
            console.log('Full editForm:', editForm);

            const response = await fetch(`/api/admin/bookings/${editForm.bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update booking');
            }

            setEditDialogOpen(false);
            setSelectedBooking(null);
            setEditForm(null);
            setAvailableSlots([]);
            mutateBookings(); 
        } catch (err) {
            console.error('Error updating booking:', err);
            setError(err instanceof Error ? err.message : 'Failed to update booking');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;

        setIsCanceling(true);
        setError(null);

        try {
            console.log('Attempting to cancel booking:', bookingToCancel.bookingId);

            const response = await fetch(`/api/admin/bookings/${bookingToCancel.bookingId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('Cancel response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Cancel booking error response:', errorData);
                throw new Error(errorData.message || errorData.error || 'Failed to cancel booking');
            }

            const data = await response.json();
            console.log('Cancel booking success:', data);

            setCancelDialogOpen(false);
            setBookingToCancel(null);
            mutateBookings(); 
        } catch (err) {
            console.error('Error canceling booking:', err);
            setError(err instanceof Error ? err.message : 'Failed to cancel booking');
        } finally {
            setIsCanceling(false);
        }
    };

    const handleCleanupCanceledBookings = async () => {
        setIsCleaningUp(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/bookings/cleanup', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to cleanup canceled bookings');
            }

            setCleanupDialogOpen(false);
            mutateBookings(); 
        } catch (err) {
            console.error('Error cleaning up bookings:', err);
            setError(err instanceof Error ? err.message : 'Failed to cleanup bookings');
        } finally {
            setIsCleaningUp(false);
        }
    };

    const handleCancelBookingFromDialog = (booking: Booking) => {
        setBookingToCancel(booking);
        setEditDialogOpen(false);
        setCancelDialogOpen(true);
    };

    const completedAndCanceledCount = bookings?.filter(booking => booking.status === 'CANCELED_BY_USER' || booking.status === 'CANCELED_BY_ADMIN' || booking.status === 'COMPLETED').length || 0;

    return (
        <div className="space-y-4">
            {statsLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <Skeleton className="h-4 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-3 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {statsError && (
                <Card className="border-destructive">
                    <CardContent className="p-6">
                        <p className="text-destructive">Error loading statistics: {statsError.message}</p>
                    </CardContent>
                </Card>
            )}

            {stats?.message && (
                <Card className="border-destructive">
                    <CardContent className="p-6">
                        <p className="text-destructive">Server error: {stats.message}</p>
                    </CardContent>
                </Card>
            )}

            {stats && !stats.message && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Total Bookings" value={stats.totalBookings} description="All time bookings" />
                    <StatCard title="Pending Bookings" value={stats.pendingBookings} description="Awaiting payment" />
                    <StatCard title="Confirmed Bookings" value={stats.confirmedBookings} description="Ready to service" />
                    <StatCard title="Completed Bookings" value={stats.completedBookings} description="Successfully finished" />
                    <StatCard title="Total Revenue" value={stats.totalRevenue !== undefined ? `$${stats.totalRevenue.toFixed(2)}` : 'N/A'} description="From confirmed & completed bookings" />
                    <StatCard title="Canceled Bookings" value={(stats.canceledByUser || 0) + (stats.canceledByAdmin || 0)} description="User + admin cancellations" />
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Recent Bookings</CardTitle>
                            <CardDescription>Click on any booking row to edit details or cancel appointments.</CardDescription>
                        </div>
                        {completedAndCanceledCount > 0 && (
                            <Button variant="outline" size="sm" onClick={() => setCleanupDialogOpen(true)} className="flex items-center gap-2">
                                <Trash2 className="w-4 h-4" />
                                Hide Completed & Canceled ({completedAndCanceledCount})
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-destructive text-sm">{error}</p>
                        </div>
                    )}

                    <BookingsTable bookings={bookings} isLoading={bookingsLoading} error={bookingsError} onRowClick={handleRowClick} emptyMessage="No bookings found." loadingRowCount={5} />
                </CardContent>
            </Card>

            <BookingEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} selectedBooking={selectedBooking} editForm={editForm} onEditFormChange={handleEditFormChange} onDateChange={handleDateChange} onTimeChange={handleTimeChange} onUpdateBooking={handleUpdateBooking} onCancelBooking={handleCancelBookingFromDialog} isUpdating={isUpdating} availableSlots={availableSlots} loadingSlots={loadingSlots} showHideButton={false} showCancelButton={true} />

            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Cancel Booking
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel the booking for <strong>{bookingToCancel?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="text-amber-600 font-medium mb-2">This action will:</div>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Mark the booking as canceled by admin</li>
                            <li>Free up the time slot for new bookings</li>
                            <li>Require separate customer notification</li>
                        </ul>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                            Keep Booking
                        </Button>
                        <Button variant="destructive" onClick={handleCancelBooking} disabled={isCanceling}>
                            {isCanceling ? 'Canceling...' : 'Cancel Booking'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={cleanupDialogOpen} onOpenChange={setCleanupDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            Hide Completed & Canceled Bookings
                        </DialogTitle>
                        <DialogDescription>
                            This will hide <strong>{completedAndCanceledCount}</strong> completed and canceled booking(s) from the recent bookings table.
                            <br />
                            <br />
                            <span className="text-blue-600 font-medium">Note:</span> Hidden bookings can still be viewed and managed in the "All Bookings" tab. Only bookings with status "Completed", "Canceled by User" or "Canceled by Admin" will be hidden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCleanupDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleCleanupCanceledBookings} disabled={isCleaningUp}>
                            {isCleaningUp ? 'Hiding...' : `Hide ${completedAndCanceledCount} Booking(s)`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
