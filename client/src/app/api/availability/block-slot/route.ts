import { proxyApi } from '@/lib/proxyApi';

export async function POST(req: Request) {
    return proxyApi(req, '/api/availability/block-slot', 'POST');
}
