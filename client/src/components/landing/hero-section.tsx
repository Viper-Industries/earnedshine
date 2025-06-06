import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden">
            <div className="h-[50vh] flex items-center justify-center">
                <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="text-center max-w-4xl">
                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight text-foreground">Perfection In Every Detail</h1>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg text-muted-foreground">
                                    <span>Services starting at $60</span>
                                    <Button asChild size="sm" className="bg-white text-black hover:bg-gray-100 font-medium text-sm px-6 py-1 rounded-full">
                                        <Link href="#interior-gallery" className="flex items-center">
                                            Learn More
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative w-full flex-1">
                <Image src="/images/hero-car.png" alt="hero-car" width={1495} height={415} className="w-full h-auto" priority />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </div>
        </section>
    );
}
