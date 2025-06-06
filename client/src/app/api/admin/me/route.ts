import { proxyApi } from '@/lib/proxyApi';

export async function GET(request: Request) {
    return proxyApi(request, '/api/admin/me', 'GET');
}
