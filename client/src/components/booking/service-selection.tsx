import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SERVICES, getServiceById } from '@/lib/services';

interface ServiceSelectionProps {
    serviceType: string;
    onServiceChange: (value: string) => void;
}

export function ServiceSelection({ serviceType, onServiceChange }: ServiceSelectionProps) {
    const selectedService = getServiceById(serviceType);

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Service Details</h3>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    {serviceType && (
                        <Select key={serviceType} value={serviceType} onValueChange={onServiceChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent>
                                {SERVICES.map(service => (
                                    <SelectItem key={service.id} value={service.id}>
                                        <div className="flex items-center gap-2">
                                            <span>
                                                {service.name} - ${service.price}
                                            </span>
                                            {service.id === 'earned_signature' && <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full font-medium">BEST CHOICE</span>}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {serviceType && selectedService && (
                    <div className="p-5 rounded-lg border" style={{ backgroundColor: 'rgb(20,20,22)' }}>
                        <h4 className="font-semibold text-base text-white mb-2">{selectedService.name}</h4>
                        <p className="text-sm text-gray-300 mb-3 leading-relaxed">{selectedService.description}</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-300">
                                Duration: {selectedService.durationHours} hour{selectedService.durationHours > 1 ? 's' : ''}
                            </span>
                            <span className="font-semibold text-white text-lg">${selectedService.price}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
