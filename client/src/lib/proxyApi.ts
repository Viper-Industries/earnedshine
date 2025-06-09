import { NextResponse } from 'next/server';

export async function proxyApi(req: Request, path: string, method: string = req.method) {
    try {
        const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:8080';
        
        console.log(`[PROXY] Starting request: ${method} ${path}`);
        console.log(`[PROXY] Backend URL: ${backendUrl}`);
        
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
            console.log(`[PROXY] Using auth header: ${authHeader.substring(0, 20)}...`);
        }
        
        const fullUrl = `${backendUrl}${path}`;
        console.log(`[PROXY] Full URL: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
            method,
            headers,
            body: method === 'GET' ? undefined : await req.text()
        });
        
        console.log(`[PROXY] Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PROXY] Backend error: ${errorText}`);
            return NextResponse.json(
                { error: 'Backend error', status: response.status, details: errorText }, 
                { status: response.status }
            );
        }
        
        const data = await response.json();
        console.log(`[PROXY] Success! Data:`, data);
        return NextResponse.json(data);
        
    } catch (error) {
        console.error(`[PROXY] Fatal error:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Proxy failed', details: errorMessage }, 
            { status: 500 }
        );
    }
}
