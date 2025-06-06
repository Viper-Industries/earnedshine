import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ConditionalNavbar } from '@/components/layout/conditional-navbar';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import './globals.css';

export const metadata: Metadata = {
    title: 'Earned Shine Detailing',
    description: 'Professional car detailing services. Book your appointment online.'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <LayoutWrapper>
                <ConditionalNavbar />
                {children}
            </LayoutWrapper>
        </html>
    );
}
