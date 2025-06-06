import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AppointmentSchedulerProps {
    appointmentDate: Date | undefined;
    appointmentTime: string;
    availableSlots: string[];
    loadingSlots: boolean;
    onDateChange: (date: Date | undefined) => void;
    onTimeChange: (time: string) => void;
}

const formatTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

export function AppointmentScheduler({ appointmentDate, appointmentTime, availableSlots, loadingSlots, onDateChange, onTimeChange }: AppointmentSchedulerProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Appointment Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Appointment Date *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !appointmentDate && 'text-muted-foreground')}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {appointmentDate ? format(appointmentDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={appointmentDate} onSelect={onDateChange} disabled={date => date < today} initialFocus />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="appointmentTime">Appointment Time *</Label>
                    <Select value={appointmentTime} onValueChange={onTimeChange} disabled={!appointmentDate || loadingSlots}>
                        <SelectTrigger>
                            <SelectValue placeholder={!appointmentDate ? 'Select date first' : loadingSlots ? 'Loading times...' : availableSlots.length === 0 ? 'No times available' : 'Select time'} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableSlots.map(slot => (
                                <SelectItem key={slot} value={slot}>
                                    {formatTimeSlot(slot)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {appointmentDate && availableSlots.length === 0 && !loadingSlots && <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md border border-yellow-200">No available time slots for this date. Please select another date.</p>}
        </div>
    );
}
