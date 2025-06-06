'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinkClass = 'text-sm text-gray-300 hover:text-white transition-colors';
    const mobileNavLinkClass = `${navLinkClass} py-2`;

    const navigationLinks = [
        { href: '/#hero', label: 'Home' },
        { href: '/#interior-gallery', label: 'Interior' },
        { href: '/#exterior-gallery', label: 'Exterior' },
        { href: '/#pricing', label: 'Pricing' },
        { href: '/#footer', label: 'Contact' }
    ];

    return (
        <nav className="fixed top-0 z-50 w-full px-4 pt-4">
            <div className={`mx-auto max-w-7xl transition-all duration-300 ease-in-out ${isScrolled ? 'bg-[rgb(20,20,22)]/50 backdrop-blur-xl border border-white/10 rounded-full shadow-lg' : 'bg-transparent border border-transparent'}`}>
                <div className="flex justify-between items-center h-14 px-6 md:grid md:grid-cols-3">
                    <div className="flex justify-start">
                        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                            <span className="font-semibold text-white text-sm">EarnedShine</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center justify-center space-x-8">
                        {navigationLinks.map(link => (
                            <Link key={link.href} href={link.href} className={navLinkClass}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <div className="flex justify-end items-center">
                        <div className="hidden md:flex items-center space-x-3">
                            <Button size="sm" className="bg-white text-black hover:bg-gray-100 font-medium h-8 px-4 rounded-full" asChild>
                                <Link href="/booking" className="flex items-center text-sm">
                                    Book Now
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </Link>
                            </Button>
                        </div>

                        <Button variant="ghost" size="sm" className="md:hidden p-2 text-white hover:bg-white/10" onClick={toggleMenu}>
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden mt-2 mx-4">
                    <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
                        <div className="px-6 py-6 space-y-4">
                            <nav className="flex flex-col space-y-4">
                                {navigationLinks.map(link => (
                                    <Link key={link.href} href={link.href} className={mobileNavLinkClass} onClick={closeMenu}>
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="flex flex-col space-y-3 pt-4 border-t border-white/10">
                                <Button size="sm" className="bg-white text-black hover:bg-gray-100 font-medium rounded-full" asChild>
                                    <Link href="/booking" onClick={closeMenu} className="flex items-center justify-center">
                                        Book now
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
