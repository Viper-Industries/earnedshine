import { proxyApi } from '@/lib/proxy-api';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const includeHidden = url.searchParams.get('includeHidden') || 'false';

    return proxyApi(request, `/api/admin/bookings?includeHidden=${includeHidden}`, 'GET');
}
