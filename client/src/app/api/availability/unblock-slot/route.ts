import { proxyApi } from '@/lib/proxyApi';

export async function POST(req: Request) {
    return proxyApi(req, '/api/availability/unblock-slot', 'POST');
}
