import { proxyApi } from '@/lib/proxy-api';

export async function POST(req: Request) {
    return proxyApi(req, '/api/availability/block-slot', 'POST');
}
