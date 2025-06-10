
import { proxyApi } from '@/lib/proxy-api';

export async function GET(req: Request, { params }: { params: Promise<{ date: string }> }) {
    const { date } = await params;
    const { searchParams } = new URL(req.url);

    const serviceType = searchParams.get('serviceType') ?? '';
    const excludeBookingId = searchParams.get('excludeBookingId') ?? '';

    
    const query = new URLSearchParams();
    if (serviceType) query.append('serviceType', serviceType);
    if (excludeBookingId) query.append('excludeBookingId', excludeBookingId);

    const queryString = query.toString();
    const path = `/api/availability/slots/${date}${queryString ? `?${queryString}` : ''}`;

    return proxyApi(req, path, 'GET');
}
