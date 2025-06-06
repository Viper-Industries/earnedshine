'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/admin');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <h1 className="text-2xl font-semibold">Authentication Successful</h1>
                <p className="text-muted-foreground">Redirecting to admin dashboard...</p>
            </div>
        </div>
    );
}
