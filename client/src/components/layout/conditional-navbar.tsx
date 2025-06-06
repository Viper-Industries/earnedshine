'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

export function ConditionalNavbar() {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    if (isAdminPage) {
        return null;
    }

    return <Navbar />;
}
