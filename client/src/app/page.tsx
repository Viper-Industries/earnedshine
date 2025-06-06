import { HeroSection } from '@/components/landing/hero-section';
import { InteriorGallery } from '@/components/landing/interior-gallery';
import { ExteriorGallery } from '@/components/landing/exterior-gallery';
import { PricingSection } from '@/components/landing/pricing-section';
import { Footer } from '@/components/layout/footer';
import FadeInWhenVisible from '@/components/ui/fade-in-section';

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <FadeInWhenVisible className="w-full" visibilityThreshold={0.4}>
                <div id="hero">
                    <HeroSection />
                </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible className="w-full">
                <div id="interior-gallery">
                    <InteriorGallery />
                </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible className="w-full mt-36">
                <div id="exterior-gallery">
                    <ExteriorGallery />
                </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible className="w-full">
                <div id="pricing">
                    <PricingSection />
                </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible className="w-full">
                <div id="footer">
                    <Footer />
                </div>
            </FadeInWhenVisible>
        </main>
    );
}
