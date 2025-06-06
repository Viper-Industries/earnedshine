'use client';

import { usePathname } from 'next/navigation';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    return <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased ${!isAdminPage ? 'pt-20' : ''}`}>{children}</body>;
}
