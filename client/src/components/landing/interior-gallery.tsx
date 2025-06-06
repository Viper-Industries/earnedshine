'use client';

import { GallerySection } from './gallery-section';

const interiorFeatures = [
    {
        title: 'Full interior vacuum',
        description: 'Carpet, trunk, seats'
    },
    {
        title: 'Deep steam cleaning',
        description: 'Floor mats, cloth seats'
    },
    {
        title: 'Dashboard & console detailing',
        description: 'Professional dashboard restoration'
    },
    {
        title: 'Window cleaning (interior)',
        description: 'Crystal clear interior windows'
    },
    {
        title: 'Leather and Plastic Conditioning',
        description: 'Protect and condition leather and plastic'
    },
    {
        title: 'Ozone Odor elimination treatment',
        description: 'Nuetralizes smoke, food, or pet odors'
    },
    {
        title: 'Stain extraction',
        description: 'Per seat/area'
    },
    {
        title: 'Vent & crevice detailing',
        description: 'Attention to every detail'
    }
];

const galleryImages = [
    { src: '/images/interior-gallery/interior1.png', alt: 'Interior detailing - dashboard cleaning', className: 'row-span-2' },
    { src: '/images/interior-gallery/interior2.png', alt: 'Interior detailing - seat cleaning', className: 'row-span-1' },
    { src: '/images/interior-gallery/interior3.png', alt: 'Interior detailing - leather conditioning', className: 'row-span-2' },
    { src: '/images/interior-gallery/interior4.png', alt: 'Interior detailing - vacuum cleaning', className: 'row-span-1' },
    { src: '/images/interior-gallery/interior5.png', alt: 'Interior detailing - window cleaning', className: 'row-span-1' },
    { src: '/images/interior-gallery/interior6.png', alt: 'Interior detailing - floor mat cleaning', className: 'row-span-2' },
    { src: '/images/interior-gallery/interior7.png', alt: 'Interior detailing - upholstery treatment', className: 'row-span-1' },
    { src: '/images/interior-gallery/interior8.png', alt: 'Interior detailing - final result', className: 'row-span-1' },
    { src: '/images/interior-gallery/interior9.png', alt: 'Interior detailing - professional service', className: 'row-span-1' }
];

export function InteriorGallery() {
    return <GallerySection title="Interior Detailing Services" features={interiorFeatures} images={galleryImages} />;
}
