import { NextResponse } from 'next/server';

export async function proxyApi(req: Request, path: string, method: string = req.method) {
    const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    ['cookie', 'authorization'].forEach(h => {
        const v = req.headers.get(h);
        if (v) headers[h.charAt(0).toUpperCase() + h.slice(1)] = v;
    });

    const body = method === 'GET' ? undefined : await req.text();

    const resp = await fetch(`${backendUrl}${path}`, {
        method,
        headers,
        body,
        credentials: 'include',
        redirect: 'follow'
    });

    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
}
