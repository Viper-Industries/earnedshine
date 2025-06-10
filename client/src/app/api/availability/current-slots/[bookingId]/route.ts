import { proxyApi } from '@/lib/proxy-api';

export async function GET(request: Request, { params }: { params: Promise<{ bookingId: string }> }) {
    const { bookingId } = await params;
    return proxyApi(request, `/api/availability/current-slots/${bookingId}`, 'GET');
}
