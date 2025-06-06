import { proxyApi } from '@/lib/proxyApi';

export async function GET(request: Request, { params }: { params: { bookingId: string } }) {
    const { bookingId } = params;
    return proxyApi(request, `/api/availability/current-slots/${bookingId}`, 'GET');
}
