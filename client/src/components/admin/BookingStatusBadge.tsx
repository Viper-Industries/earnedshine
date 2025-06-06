import { Badge } from '@/components/ui/badge';

interface BookingStatusBadgeProps {
    status: string;
    type?: 'booking' | 'availability';
}

export function BookingStatusBadge({ status, type = 'booking' }: BookingStatusBadgeProps) {
    if (type === 'availability') {
        switch (status) {
            case 'AVAILABLE':
                return (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Available
                    </Badge>
                );
            case 'BLOCKED':
                return (
                    <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Blocked
                    </Badge>
                );
            case 'BOOKED':
                return (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                        Booked
                    </Badge>
                );
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    }

    switch (status) {
        case 'PENDING_PAYMENT':
            return (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    Pending Payment
                </Badge>
            );
        case 'CONFIRMED':
            return (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    Confirmed
                </Badge>
            );
        case 'COMPLETED':
            return (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Completed
                </Badge>
            );
        case 'CANCELED_BY_USER':
            return (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    Canceled by User
                </Badge>
            );
        case 'CANCELED_BY_ADMIN':
            return (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                    Canceled by Admin
                </Badge>
            );
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}
