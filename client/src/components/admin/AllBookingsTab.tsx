'use client';

import useSWR from 'swr';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingEditDialog } from './BookingEditDialog';
import { BookingsTable } from './BookingsTable';
import { fetcher } from '@/lib/admin-utils';
import { Booking } from '@/types/admin';

export function AllBookingsTab() {
    const { data: allBookings, error: bookingsError, isLoading: bookingsLoading, mutate: mutateBookings } = useSWR<Booking[]>('/api/admin/bookings?includeHidden=true', fetcher);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [editForm, setEditForm] = useState<Booking | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const filteredBookings =
        allBookings?.filter(booking => {
            const matchesSearch = searchTerm === '' || booking.name.toLowerCase().includes(searchTerm.toLowerCase()) || booking.email.toLowerCase().includes(searchTerm.toLowerCase()) || booking.phone.includes(searchTerm) || booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) || booking.address.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || (statusFilter === 'hidden' && booking.hidden) || (statusFilter === 'visible' && !booking.hidden) || booking.status === statusFilter;

            return matchesSearch && matchesStatus;
        }) || [];

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

    const handleToggleHidden = async (booking: Booking) => {
        setError(null);
        try {
            if (booking.hidden) {
                const response = await fetch(`/api/admin/bookings/${booking.bookingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...booking, hidden: false })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to unhide booking');
                }
            } else {
                const response = await fetch(`/api/admin/bookings/${booking.bookingId}/hide`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to hide booking');
                }
            }
            setEditDialogOpen(false);
            setSelectedBooking(null);
            setEditForm(null);
            mutateBookings(); 
        } catch (err) {
            console.error('Error toggling booking visibility:', err);
            setError(err instanceof Error ? err.message : 'Failed to toggle booking visibility');
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>Search and manage all bookings including hidden ones</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input id="search" placeholder="Search by name, email, phone, booking ID, or address..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                                {searchTerm && (
                                    <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" onClick={() => setSearchTerm('')}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="w-full sm:w-48 space-y-4">
                            <Label htmlFor="status-filter">Filter by Status</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Bookings</SelectItem>
                                    <SelectItem value="visible">Visible Only</SelectItem>
                                    <SelectItem value="hidden">Hidden Only</SelectItem>
                                    <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="CANCELED_BY_USER">Canceled by User</SelectItem>
                                    <SelectItem value="CANCELED_BY_ADMIN">Canceled by Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground border-t pt-4">
                        Showing {filteredBookings.length} of {allBookings?.length || 0} bookings
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-destructive">
                    <CardContent className="p-4">
                        <p className="text-destructive">{error}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Bookings List</CardTitle>
                    <CardDescription>Click on any row to edit booking details</CardDescription>
                </CardHeader>
                <CardContent>
                    <BookingsTable bookings={filteredBookings} isLoading={bookingsLoading} error={bookingsError} onRowClick={handleRowClick} emptyMessage={searchTerm || statusFilter !== 'all' ? 'No bookings match your search criteria.' : 'No bookings found.'} loadingRowCount={8} />
                </CardContent>
            </Card>

            <BookingEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} selectedBooking={selectedBooking} editForm={editForm} onEditFormChange={handleEditFormChange} onDateChange={handleDateChange} onTimeChange={handleTimeChange} onUpdateBooking={handleUpdateBooking} onToggleHidden={handleToggleHidden} isUpdating={isUpdating} availableSlots={availableSlots} loadingSlots={loadingSlots} showHideButton={true} showCancelButton={false} />
        </div>
    );
}
