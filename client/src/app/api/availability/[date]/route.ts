import { proxyApi } from '@/lib/proxyApi';

export async function GET(req: Request, { params }: { params: Promise<{ date: string }> }) {
    const { date } = await params;
    return proxyApi(req, `/api/availability/${date}`, 'GET');
}
