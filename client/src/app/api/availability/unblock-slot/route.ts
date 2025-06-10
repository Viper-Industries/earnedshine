import { proxyApi } from '@/lib/proxy-api';

export async function POST(req: Request) {
    return proxyApi(req, '/api/availability/unblock-slot', 'POST');
}
