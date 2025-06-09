'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, User } from 'lucide-react';
import React from 'react';
import type { User as UserType } from '@/types/user';

interface InjectedProps {
    user: UserType;
    handleLogout: () => Promise<void>;
}

interface AuthWrapperProps {
    children: React.ReactElement;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (tokenFromUrl) {
            localStorage.setItem('authToken', tokenFromUrl);
            setAuthToken(tokenFromUrl);
            router.replace('/admin');
        } else {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                setAuthToken(storedToken);
            }
        }
    }, [searchParams, router]);

    const checkAuthStatus = async () => {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };

            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch('/api/admin/me', {
                credentials: 'include',
                headers
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData.authenticated) {
                    setUser(userData);
                } else {
                    setUser(null);
                    localStorage.removeItem('authToken');
                    setAuthToken(null);
                }
            } else {
                setUser(null);
                localStorage.removeItem('authToken');
                setAuthToken(null);
            }
        } catch (err) {
            console.error('Error checking auth status:', err);
            setUser(null);
            setError('Failed to check authentication status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authToken !== null) {
            checkAuthStatus();
        } else {
            setLoading(false);
        }
    }, [authToken]);

    const handleLogin = async () => {
        try {
            const backendUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                ? 'http://localhost:8080' 
                : 'https://api.earnedshine.com';
            window.location.href = `${backendUrl}/oauth2/authorization/cognito`;
        } catch (err) {
            console.error('Error initiating login:', err);
            setError('Failed to initiate login');
        }
    };

    const handleLogout = async () => {
        try {
            localStorage.removeItem('authToken');
            setAuthToken(null);
            setUser(null);

            try {
                const response = await fetch('/api/auth/logout-url');
                if (response.ok) {
                    const { logoutUrl } = await response.json();
                    window.open(logoutUrl, '_blank');
                }
            } catch (err) {
                console.log('Unable to get backend logout URL, continuing with local logout');
            }

            setTimeout(() => {
                window.location.href = '/admin';
            }, 100);
        } catch (err) {
            console.error('Error during logout:', err);
            localStorage.removeItem('authToken');
            setAuthToken(null);
            setUser(null);
            window.location.href = '/admin';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking authentication...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Admin Access Required</CardTitle>
                        <CardDescription>Please sign in with your administrator account to access the dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">{error}</div>}
                        <Button onClick={handleLogin} className="w-full" size="lg">
                            <User className="mr-2 h-4 w-4" />
                            Sign In with AWS Cognito
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {React.cloneElement(
                children as React.ReactElement<Partial<InjectedProps>>,
                { user, handleLogout }
            )}
        </div>
    );
}
