import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function PricingSection() {
    const packages = [
        {
            name: 'BASIC SHINE PACKAGE',
            price: '$60',
            duration: '45-60 min',
            description: 'Perfect for routine maintenance or quick refresh',
            serviceId: 'basic_shine',
            features: ['Hand wash & foam bath', 'Wheel & tire cleaning + shine', 'Interior vacuum', 'Light interior wipe down', 'Windows (inside & out)', 'Finishing spray wax'],
            popular: false
        },
        {
            name: 'FULL INTERIOR SHINE',
            price: '$90',
            duration: '1.5-2 hrs',
            description: 'Deep clean for the inside of your ride',
            serviceId: 'full_interior',
            features: ['Full interior vacuum (carpet, seats, trunk)', 'Deep steam cleaning (floors, mats, cloth seats)', 'Leather/plastic conditioning', 'Cupholders, vents, door panels detailed'],
            popular: false
        },
        {
            name: 'THE EARNED SHINE SIGNATURE PACKAGE',
            price: '$130',
            duration: '2.5-3 hrs',
            description: 'Our full interior & exterior transformation',
            serviceId: 'earned_signature',
            features: ['Includes everything in both full interior & exterior packages', 'Ceramic sealant upgrade', 'Engine bay light wipe-down (optional)', 'High-gloss finish'],
            popular: true
        }
    ];

    const exteriorAddOns = [
        { name: 'Clay Bar Treatment', price: '$40', description: 'Removes bonded contaminants for a smooth-as-glass finish' },
        { name: 'Headlight Restoration', price: '$30', description: 'Clears foggy or yellowed headlights for safer, sharper lighting' },
        { name: 'High-Gloss Tire Dressing', price: '$10', description: 'Gives tires that deep, clean showroom shine' },
        { name: 'Windshield Rain Repellent Coating', price: '$15', description: 'Enhances visibility during rain and helps water bead off' }
    ];

    const interiorAddOns = [
        { name: 'Pet Hair Removal', price: '$20+', description: 'Specialized tools to get stubborn pet hair out of seats and carpet' },
        { name: 'Ozone Odor Treatment', price: '$30', description: 'Neutralizes smoke, food, or pet odors — not just masks them' },
        { name: 'Stain Extraction (Per Seat/Area)', price: '$10+', description: 'Spot treatment for tough spills or built-up stains' }
    ];

    const specialtyServices = [
        { name: 'Engine Bay Deep Cleaning', price: '$30', description: 'Degreased and detailed — perfect for resale or shows' },
        { name: 'Scratch & Paint Touch-Up', price: 'Ask for Quote', description: 'Light scratches or minor paint blemishes touched up on-site' }
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl mb-4 font-medium text-foreground">Pricing</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Professional car detailing services that bring out the best in your vehicle.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {packages.map((pkg, index) => (
                        <Card key={index} className={`relative h-full bg-card/30 border-border/30 ${pkg.popular ? 'ring-1 ring-border/60' : ''}`}>
                            {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1 text-xs">
                                        <Star className="w-3 h-3" />
                                        BEST CHOICE
                                    </Badge>
                                </div>
                            )}
                            <CardHeader className="text-center pb-4">
                                <CardTitle className="text-lg font-medium text-foreground mb-2">{pkg.name}</CardTitle>
                                <div className="text-3xl font-bold text-foreground mb-2">{pkg.price}</div>
                                <div className="flex items-center justify-center text-muted-foreground mb-3">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span className="text-sm">Approx. {pkg.duration}</span>
                                </div>
                                <CardDescription className="text-muted-foreground text-sm">{pkg.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0 flex-1 flex flex-col">
                                <div className="space-y-2 flex-1">
                                    {pkg.features.map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full mt-6" asChild>
                                    <Link href={`/booking?service=${pkg.serviceId}`}>Book Now</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-12">
                    <div className="text-center">
                        <h3 className="text-2xl md:text-3xl font-medium text-foreground mb-4">Add-Ons & Extras</h3>
                        <p className="text-muted-foreground">Take your detail to the next level — customize your shine. These can be added to any package.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xl font-medium text-foreground mb-4">Exterior Upgrades</h4>
                            <div className="space-y-3">
                                {exteriorAddOns.map((addon, index) => (
                                    <div key={index} className="bg-card/30 border border-border/30 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-medium text-foreground text-sm">{addon.name}</h5>
                                            <span className="text-sm font-medium text-foreground">{addon.price}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xl font-medium text-foreground mb-4">Interior Upgrades</h4>
                            <div className="space-y-3">
                                {interiorAddOns.map((addon, index) => (
                                    <div key={index} className="bg-card/30 border border-border/30 rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-medium text-foreground text-sm">{addon.name}</h5>
                                            <span className="text-sm font-medium text-foreground">{addon.price}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xl font-medium text-foreground mb-4">Specialty Services</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                            {specialtyServices.map((service, index) => (
                                <div key={index} className="bg-card/30 border border-border/30 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h5 className="font-medium text-foreground text-sm">{service.name}</h5>
                                        <span className="text-sm font-medium text-foreground">{service.price}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
