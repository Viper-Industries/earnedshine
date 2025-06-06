'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookingStatusBadge } from './BookingStatusBadge';
import { formatServiceType, formatVehicleType, formatDate, formatAddonName } from '@/lib/admin-utils';
import { Booking } from '@/types/admin';

interface BookingsTableProps {
    bookings: Booking[] | undefined;
    isLoading: boolean;
    error: any;
    onRowClick: (booking: Booking) => void;
    emptyMessage?: string;
    loadingRowCount?: number;
}

export function BookingsTable({ bookings, isLoading, error, onRowClick, emptyMessage = 'No bookings found.', loadingRowCount = 5 }: BookingsTableProps) {
    if (isLoading) {
        return (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Add-ons</TableHead>
                            <TableHead>Appointment</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: loadingRowCount }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div>
                                        <Skeleton className="h-4 w-24 mb-1" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-32" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <Skeleton className="h-4 w-20 mb-1" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-destructive py-8">Error loading bookings: {error.message}</p>;
    }

    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-muted-foreground py-8">{emptyMessage}</p>;
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Add-ons</TableHead>
                        <TableHead>Appointment</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bookings.map(booking => (
                        <TableRow key={booking.bookingId} className={`cursor-pointer hover:bg-muted/50 transition-colors ${booking.hidden ? 'opacity-60' : ''}`} onClick={() => onRowClick(booking)}>
                            <TableCell>
                                <div>
                                    <div className="font-medium">{booking.name}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium">{formatServiceType(booking.serviceType)}</div>
                                    <div className="text-sm text-muted-foreground">{formatVehicleType(booking.vehicleType)}</div>
                                </div>
                            </TableCell>
                            <TableCell className="text-sm">
                                {booking.addons && booking.addons.length > 0 ? (
                                    <span className="font-medium">
                                        {booking.addons.length} add-on{booking.addons.length > 1 ? 's' : ''}
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">None</span>
                                )}
                            </TableCell>
                            <TableCell>{formatDate(booking.appointmentTime)}</TableCell>
                            <TableCell>
                                <Badge variant={booking.paymentMethod === 'ONLINE' ? 'default' : 'secondary'}>{booking.paymentMethod === 'ONLINE' ? 'Online' : 'In Person'}</Badge>
                            </TableCell>
                            <TableCell>
                                <BookingStatusBadge status={booking.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
