import { proxyApi } from '@/lib/proxy-api';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return proxyApi(req, `/api/admin/bookings/${id}`, 'PUT');
}
