import { proxyApi } from '@/lib/proxyApi';

export async function DELETE(req: Request) {
    return proxyApi(req, '/api/admin/bookings/cleanup', 'DELETE');
}
