'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formatTimeSlot, getCurrentDate, getCurrentTime, formatAddonName, TIME_SLOTS } from '@/lib/admin-utils';
import { Booking } from '@/types/admin';
import { SERVICES, ADDONS, getAddonById } from '@/lib/services';

interface BookingEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedBooking: Booking | null;
    editForm: Booking | null;
    onEditFormChange: (field: keyof Booking, value: string | boolean | string[]) => void;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
    onUpdateBooking: () => void;
    onToggleHidden?: (booking: Booking) => void;
    onCancelBooking?: (booking: Booking) => void;
    isUpdating: boolean;
    availableSlots: string[];
    loadingSlots: boolean;
    showHideButton?: boolean;
    showCancelButton?: boolean;
}

export function BookingEditDialog({ open, onOpenChange, selectedBooking, editForm, onEditFormChange, onDateChange, onTimeChange, onUpdateBooking, onToggleHidden, onCancelBooking, isUpdating, availableSlots, loadingSlots, showHideButton = false, showCancelButton = false }: BookingEditDialogProps) {
    const [addingAddon, setAddingAddon] = useState(false);
    const [selectedNewAddon, setSelectedNewAddon] = useState<string>('');
    const [currentSlots, setCurrentSlots] = useState<string[]>([]);
    const [loadingCurrentSlots, setLoadingCurrentSlots] = useState(false);
    
    const availableAddons = ADDONS.filter(addon => !editForm?.addons?.includes(addon.id));

    const handleRemoveAddon = (addonId: string) => {
        if (editForm?.addons) {
            const newAddons = editForm.addons.filter(id => id !== addonId);
            onEditFormChange('addons', newAddons);
        }
    };

    useEffect(() => {
        const fetchCurrentSlots = async () => {
            if (!selectedBooking?.bookingId) {
                setCurrentSlots([]);
                return;
            }

            setLoadingCurrentSlots(true);
            try {
                const response = await fetch(`/api/availability/current-slots/${selectedBooking.bookingId}`);
                if (response.ok) {
                    const data = await response.json();
                    setCurrentSlots(data.currentSlots || []);
                } else {
                    console.error('Failed to fetch current slots');
                    setCurrentSlots([]);
                }
            } catch (error) {
                console.error('Error fetching current slots:', error);
                setCurrentSlots([]);
            } finally {
                setLoadingCurrentSlots(false);
            }
        };

        if (open && selectedBooking) {
            fetchCurrentSlots();
        } else {
            setCurrentSlots([]);
        }
    }, [open, selectedBooking?.bookingId]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-3xl !max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Booking</DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-1">
                            <div>
                                Booking ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{selectedBooking?.bookingId}</code>
                            </div>
                            {selectedBooking?.createdAt && (
                                <div className="text-muted-foreground">
                                    Created: {new Date(selectedBooking.createdAt).toLocaleDateString()} at {new Date(selectedBooking.createdAt).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>

                {editForm && (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Customer Name</Label>
                                <Input id="edit-name" value={editForm.name || ''} onChange={e => onEditFormChange('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input id="edit-phone" value={editForm.phone || ''} onChange={e => onEditFormChange('phone', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input id="edit-email" type="email" value={editForm.email || ''} onChange={e => onEditFormChange('email', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-address">Address</Label>
                                <Input id="edit-address" value={editForm.address || ''} onChange={e => onEditFormChange('address', e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-service">Service Type</Label>
                                <Select value={editForm.serviceType} onValueChange={value => onEditFormChange('serviceType', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SERVICES.map(service => (
                                            <SelectItem key={service.id} value={service.id}>
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-vehicle">Vehicle Type</Label>
                                <Select value={editForm.vehicleType} onValueChange={value => onEditFormChange('vehicleType', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sedan">Sedan/Coupe</SelectItem>
                                        <SelectItem value="suv">SUV/Minivan</SelectItem>
                                        <SelectItem value="truck">Truck</SelectItem>
                                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Selected Add-ons</Label>
                            <div className="p-3 bg-muted/20 border rounded-lg">
                                {editForm.addons && editForm.addons.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {editForm.addons.map((addonId, index) => {
                                            const addon = getAddonById(addonId);
                                            return (
                                                <div key={index} className="group relative inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors">
                                                    <span>{addon ? addon.name : formatAddonName(addonId)}</span>
                                                    {addon && <span className="ml-1 text-xs opacity-70">(${addon.price})</span>}
                                                    <button type="button" onClick={() => handleRemoveAddon(addonId)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground mb-3">No add-ons selected</p>
                                )}

                                {availableAddons.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Select
                                            value={selectedNewAddon}
                                            onValueChange={value => {
                                                setSelectedNewAddon(value);
                                                if (value && editForm?.addons) {
                                                    const newAddons = [...editForm.addons, value];
                                                    onEditFormChange('addons', newAddons);
                                                    setSelectedNewAddon('');
                                                }
                                            }}
                                            open={addingAddon}
                                            onOpenChange={setAddingAddon}
                                        >
                                            <SelectTrigger className="flex items-center gap-1 h-8 w-auto px-3 py-1 border border-input bg-background hover:bg-accent hover:text-accent-foreground">
                                                <Plus className="h-3 w-3" />
                                                <span>Add Add-on</span>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableAddons.map(addon => (
                                                    <SelectItem key={addon.id} value={addon.id}>
                                                        <div className="flex justify-between items-center w-full">
                                                            <span>{addon.name}</span>
                                                            <span className="text-xs text-muted-foreground ml-2">${addon.price}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {availableAddons.length === 0 && <p className="text-xs text-muted-foreground mt-2">All available add-ons have been selected</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-date">Appointment Date</Label>
                                <Input id="edit-date" type="date" value={editForm.appointmentTime.split('T')[0]} min={getCurrentDate()} onChange={e => onDateChange(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-time">Appointment Time</Label>

                                {(() => {
                                    const merged = Array.from(new Set([...availableSlots, ...currentSlots])).sort((a, b) => TIME_SLOTS.indexOf(a) - TIME_SLOTS.indexOf(b));

                                    return (
                                        <Select value={getCurrentTime(editForm.appointmentTime)} onValueChange={onTimeChange} disabled={loadingSlots || loadingCurrentSlots}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {(loadingSlots || loadingCurrentSlots) && (
                                                    <SelectItem disabled value="loading">
                                                        Loading…
                                                    </SelectItem>
                                                )}

                                                {!loadingSlots && !loadingCurrentSlots && merged.length === 0 && (
                                                    <SelectItem disabled value="none">
                                                        No slots
                                                    </SelectItem>
                                                )}

                                                {!loadingSlots &&
                                                    !loadingCurrentSlots &&
                                                    merged.map(slot => {
                                                        const start = selectedBooking && slot === getCurrentTime(selectedBooking.appointmentTime);
                                                        const inside = selectedBooking && currentSlots.includes(slot) && !start;

                                                        let label = formatTimeSlot(slot);
                                                        if (start) label += ' (Current Start)';
                                                        else if (inside) label += ' (Current)';

                                                        return (
                                                            <SelectItem key={slot} value={slot}>
                                                                {label}
                                                            </SelectItem>
                                                        );
                                                    })}
                                            </SelectContent>
                                        </Select>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select value={editForm.status} onValueChange={value => onEditFormChange('status', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING_PAYMENT">Pending Payment</SelectItem>
                                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELED_BY_USER">Canceled by User</SelectItem>
                                        <SelectItem value="CANCELED_BY_ADMIN">Canceled by Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-payment">Payment Method</Label>
                                <Select value={editForm.paymentMethod} onValueChange={value => onEditFormChange('paymentMethod', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ONLINE">Online</SelectItem>
                                        <SelectItem value="IN_PERSON">In Person</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    {showHideButton && selectedBooking && onToggleHidden && (
                        <Button variant="secondary" onClick={() => onToggleHidden(selectedBooking)} className="flex items-center gap-2">
                            {selectedBooking.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            {selectedBooking.hidden ? 'Unhide' : 'Hide'}
                        </Button>
                    )}
                    {showCancelButton && selectedBooking && onCancelBooking && (
                        <Button variant="destructive" onClick={() => onCancelBooking(selectedBooking)} disabled={selectedBooking.status === 'CANCELED_BY_USER' || selectedBooking.status === 'CANCELED_BY_ADMIN'}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel Booking
                        </Button>
                    )}
                    <Button onClick={onUpdateBooking} disabled={isUpdating}>
                        {isUpdating ? 'Updating...' : 'Update Booking'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
