import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ADDONS, getServiceById } from '@/lib/services';

interface BookingSummaryProps {
    serviceType: string;
    selectedAddons: string[];
    paymentMethod: 'ONLINE' | 'IN_PERSON';
    isLoading: boolean;
    loadingSlots: boolean;
    availableSlots: string[];
    onPaymentMethodChange: (value: 'ONLINE' | 'IN_PERSON') => void;
}

export function BookingSummary({ serviceType, selectedAddons, paymentMethod, isLoading, loadingSlots, availableSlots, onPaymentMethodChange }: BookingSummaryProps) {
    const calculateTotal = () => {
        const selectedService = getServiceById(serviceType);
        const servicePrice = selectedService ? selectedService.price : 0;
        const addonTotal = selectedAddons.reduce((total, addonId) => {
            const addon = ADDONS.find(a => a.id === addonId);
            return total + (addon ? addon.price : 0);
        }, 0);
        return servicePrice + addonTotal;
    };

    const selectedService = getServiceById(serviceType);

    return (
        <div className="mt-10 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                    {selectedAddons.length > 0 && (
                        <div className="space-y-6">
                            <div className="p-5 rounded-lg border" style={{ backgroundColor: 'rgb(20,20,22)' }}>
                                <h5 className="font-semibold text-white mb-4">Selected Add-ons:</h5>
                                <div className="space-y-3">
                                    {selectedAddons.map(addonId => {
                                        const addon = ADDONS.find(a => a.id === addonId);
                                        return addon ? (
                                            <div key={addonId} className="flex justify-between text-gray-300">
                                                <span>{addon.name}</span>
                                                <span className="font-semibold">+${addon.price}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 rounded-lg border" style={{ backgroundColor: 'rgb(20,20,22)' }}>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-semibold text-white">Total Price:</span>
                        <span className="text-3xl font-bold text-white">${calculateTotal()}</span>
                    </div>
                    {selectedAddons.length > 0 && (
                        <div className="pt-4 border-t border-gray-600 space-y-3 mb-6">
                            <div className="flex justify-between text-gray-300">
                                <span>Base service:</span>
                                <span className="font-semibold">${selectedService?.price || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Add-ons:</span>
                                <span className="font-semibold">
                                    +$
                                    {selectedAddons.reduce((total, addonId) => {
                                        const addon = ADDONS.find(a => a.id === addonId);
                                        return total + (addon ? addon.price : 0);
                                    }, 0)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={`space-y-4 ${selectedAddons.length > 0 ? '' : 'pt-6 border-t border-gray-600'}`}>
                        <div className="p-4 rounded-lg space-y-4" style={{ backgroundColor: 'rgb(9,9,11)' }}>
                            <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3">
                                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                    <RadioGroupItem value="IN_PERSON" id="in_person" />
                                    <Label htmlFor="in_person" className="cursor-pointer font-medium text-gray-200">
                                        Pay In Person (Cash, Zelle, Venmo, Apple Pay) On Service Day
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                    <RadioGroupItem value="ONLINE" id="online" />
                                    <Label htmlFor="online" className="cursor-pointer font-medium text-gray-200">
                                        Pay Online Now (Credit/Debit Card)
                                    </Label>
                                </div>
                            </RadioGroup>

                            <Button type="submit" className="w-full text-lg font-semibold" size="lg" disabled={isLoading || loadingSlots || availableSlots.length === 0}>
                                {isLoading ? 'Processing...' : paymentMethod === 'ONLINE' ? 'Proceed to Payment' : 'Book Appointment'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
