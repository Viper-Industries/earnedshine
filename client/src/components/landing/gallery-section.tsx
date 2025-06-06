'use client';

import Image from 'next/image';

interface Feature {
    title: string;
    description: string;
}

interface GalleryImage {
    src: string;
    alt: string;
    className: string;
}

interface GallerySectionProps {
    title: string;
    features: Feature[];
    images: GalleryImage[];
}

export function GallerySection({ title, features, images }: GallerySectionProps) {
    return (
        <section className="-mt-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-6 mb-16">
                    <div></div>
                </div>

                <div>
                    <div className="max-w-6xl mx-auto">
                        <h3 className="text-3xl md:text-4xl mb-10 text-center font-medium">{title}</h3>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                            {features.map((feature, index) => (
                                <div key={index} className="relative bg-card/30 border border-border/30 rounded-lg p-4">
                                    <h4 className="font-medium text-sm text-foreground leading-tight">{feature.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] max-w-6xl mx-auto">
                            {images.map((image, index) => (
                                <div key={index} className={`relative overflow-hidden rounded-xl shadow-lg ${image.className}`}>
                                    <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
