import { proxyApi } from '@/lib/proxy-api';

export async function DELETE(req: Request) {
    return proxyApi(req, '/api/admin/bookings/cleanup', 'DELETE');
}
