import { proxyApi } from '@/lib/proxy-api';

export async function GET(req: Request, { params }: { params: Promise<{ date: string; slot: string }> }) {
    const { date, slot } = await params;
    return proxyApi(req, `/api/availability/booking-details/${date}/${slot}`, 'GET');
}
