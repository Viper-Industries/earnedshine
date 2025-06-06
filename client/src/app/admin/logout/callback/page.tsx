'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function LogoutCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        
        localStorage.removeItem('authToken');

        
        sessionStorage.clear();

        
        const timer = setTimeout(() => {
            router.push('/admin');
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <h1 className="text-2xl font-semibold">Logged Out Successfully</h1>
                <p className="text-muted-foreground">You have been signed out. Redirecting to login page...</p>
            </div>
        </div>
    );
}
