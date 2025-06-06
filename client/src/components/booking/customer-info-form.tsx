import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CustomerInfoFormProps {
    formData: {
        name: string;
        email: string;
        phone: string;
        address: string;
        vehicleType: string;
    };
    onInputChange: (field: 'name' | 'email' | 'phone' | 'address' | 'vehicleType', value: string | Date | undefined) => void;
}

const vehicleTypes = [
    { id: 'sedan', name: 'Sedan/Coupe' },
    { id: 'suv', name: 'SUV/Minivan' },
    { id: 'truck', name: 'Truck' },
    { id: 'motorcycle', name: 'Motorcycle' }
];

export function CustomerInfoForm({ formData, onInputChange }: CustomerInfoFormProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold border-b pb-2">Customer Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" type="text" value={formData.name} onChange={e => onInputChange('name', e.target.value)} placeholder="Enter your full name" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={e => onInputChange('email', e.target.value)} placeholder="Enter your email" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={e => onInputChange('phone', e.target.value)} placeholder="(555) 123-4567" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="vehicleType">Vehicle Type *</Label>
                    <Select value={formData.vehicleType} onValueChange={value => onInputChange('vehicleType', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                            {vehicleTypes.map(type => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Service Address *</Label>
                <Input id="address" type="text" value={formData.address} onChange={e => onInputChange('address', e.target.value)} placeholder="Enter the address where service will be performed" required />
            </div>
        </div>
    );
}
