import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    env: {
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:8080'
    },
    async rewrites() {
        return [
            {
                source: '/api/bookings/:path*',
                destination: `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/bookings/:path*`
            }
        ];
    }
};

export default nextConfig;
