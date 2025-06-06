'use client';

import { GallerySection } from './gallery-section';

const exteriorFeatures = [
    {
        title: 'Clay bar treatment',
        description: 'Removes bonded contaminants'
    },
    {
        title: 'Headlight restoration',
        description: 'Clears foggy or yellowed headlights'
    },
    {
        title: 'High-gloss tire dressing',
        description: 'Deep, clean showroom shine for tires'
    },
    {
        title: 'Rain repellent coating',
        description: 'Enhanced visibility during rain'
    },
    {
        title: 'Engine bay deep cleaning',
        description: 'Degreased and detailed for resale'
    },
    {
        title: 'Scratch & paint touch-up',
        description: 'Minor blemishes touched up on-site'
    },
    {
        title: 'Ceramic sealant protection',
        description: 'Long-lasting paint protection'
    },
    {
        title: 'Wheel & rim detailing',
        description: 'Professional wheel restoration'
    }
];

const galleryImages = [
    { src: '/images/exterior-gallery/exterior1.png', alt: 'Exterior detailing - full vehicle wash', className: 'row-span-2' },
    { src: '/images/exterior-gallery/exterior2.png', alt: 'Exterior detailing - clay bar treatment', className: 'row-span-1' },
    { src: '/images/exterior-gallery/exterior3.png', alt: 'Exterior detailing - headlight restoration', className: 'row-span-2' },
    { src: '/images/exterior-gallery/exterior4.png', alt: 'Exterior detailing - tire dressing', className: 'row-span-1' },
    { src: '/images/exterior-gallery/exterior5.png', alt: 'Exterior detailing - paint correction', className: 'row-span-1' },
    { src: '/images/exterior-gallery/exterior6.png', alt: 'Exterior detailing - ceramic coating', className: 'row-span-2' },
    { src: '/images/exterior-gallery/exterior7.png', alt: 'Exterior detailing - wheel cleaning', className: 'row-span-1' },
    { src: '/images/exterior-gallery/exterior8.png', alt: 'Exterior detailing - final result', className: 'row-span-1' },
    { src: '/images/exterior-gallery/exterior9.png', alt: 'Exterior detailing - professional service', className: 'row-span-1' }
];

export function ExteriorGallery() {
    return <GallerySection title="Exterior Detailing Services" features={exteriorFeatures} images={galleryImages} />;
}
