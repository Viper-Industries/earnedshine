import { proxyApi } from '@/lib/proxy-api';

export async function GET(request: Request) {
    return proxyApi(request, '/api/admin/me', 'GET');
}
