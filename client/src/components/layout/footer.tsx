import { Phone, MapPin, CreditCard, Clock, Shield } from 'lucide-react';

export function Footer() {
    return (
        <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border/30">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
                    <div className="text-center lg:text-left space-y-4">
                        <h3 className="text-2xl font-medium text-foreground">EarnedShine</h3>
                        <p className="text-muted-foreground leading-relaxed">Professional mobile car detailing serving Austin, TX. We bring the showroom shine directly to your location.</p>
                        <div className="flex items-center justify-center lg:justify-start gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">Serving Austin, TX</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-lg font-medium text-foreground text-center lg:text-left">Service Information</h4>

                        <div className="space-y-3">
                            <div className="bg-card/30 border border-border/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPin className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">Mobile Service</p>
                                        <p className="text-xs text-muted-foreground">We come to you anywhere in Austin, TX</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card/30 border border-border/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CreditCard className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">Payment Options</p>
                                        <p className="text-xs text-muted-foreground">Cash, Zelle, Venmo, Apple Pay. No card fees.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card/30 border border-border/30 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Clock className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">Cancellation Policy</p>
                                        <p className="text-xs text-muted-foreground">Please give 24 hours notice</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center lg:text-left space-y-6">
                        <h4 className="text-lg font-medium text-foreground">Get In Touch</h4>

                        <div className="bg-card/30 border border-border/30 rounded-lg p-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-center lg:justify-start gap-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">Questions? Call/text us:</span>
                                </div>
                                <a href="tel:+16692250372" className="text-xl font-medium text-foreground block">
                                    (669) 225-0372
                                </a>
                                <p className="text-xs text-muted-foreground">Available 7 days a week</p>
                            </div>
                        </div>

                        <div className="bg-card/30 border border-border/30 rounded-lg p-4">
                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                                <Shield className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium text-foreground">Satisfaction Guaranteed</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Professional service you can trust</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/30 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-muted-foreground text-sm">© 2025 EarnedShine. All rights reserved.</p>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <span>Licensed & Insured</span>
                            <span>•</span>
                            <span>Eco-Friendly Products</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
