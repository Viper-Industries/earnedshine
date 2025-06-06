import { ADDONS } from '@/lib/services';
import { cn } from '@/lib/utils';

interface CheckboxCardProps {
    id: string;
    name: string;
    price: number;
    checked: boolean;
    onToggle: () => void;
}

const CheckboxCard = ({ id, name, price, checked, onToggle }: CheckboxCardProps) => {
    return (
        <div className={cn('flex items-center space-x-4 p-4 border rounded-lg transition-all cursor-pointer', 'hover:bg-accent/50', checked ? 'border-primary/50 bg-primary/5' : 'border-border')} onClick={onToggle}>
            <div className={cn('w-4 h-4 border-2 rounded flex items-center justify-center transition-colors', checked ? 'bg-primary border-primary' : 'border-input')}>
                {checked && (
                    <svg className="w-3 h-3 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <span className="font-medium">{name}</span>
                    <span className="text-sm text-muted-foreground font-semibold">+${price}</span>
                </div>
            </div>
        </div>
    );
};

interface AddonSelectionProps {
    selectedAddons: string[];
    onAddonToggle: (addonId: string) => void;
}

export function AddonSelection({ selectedAddons, onAddonToggle }: AddonSelectionProps) {
    const exteriorAddons = ADDONS.filter(addon => ['clay_bar_treatment', 'headlight_restoration', 'high_gloss_tire_dressing', 'windshield_rain_repellent'].includes(addon.id));
    const interiorAddons = ADDONS.filter(addon => ['pet_hair_removal', 'ozone_odor_treatment', 'stain_extraction'].includes(addon.id));
    const specialtyAddons = ADDONS.filter(addon => ['engine_bay_deep_cleaning'].includes(addon.id));

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold border-b pb-2">Add-ons & Extras (Optional)</h3>
                <p className="text-muted-foreground text-sm mt-2">Take your detail to the next level — customize your shine. These can be added to any package.</p>
            </div>

            <div className="space-y-4">
                <h4 className="text-lg font-semibold">Exterior Upgrades</h4>
                <div className="grid grid-cols-1 gap-3">
                    {exteriorAddons.map(addon => (
                        <CheckboxCard key={addon.id} id={addon.id} name={addon.name} price={addon.price} checked={selectedAddons.includes(addon.id)} onToggle={() => onAddonToggle(addon.id)} />
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-lg font-semibold">Interior Upgrades</h4>
                <div className="grid grid-cols-1 gap-3">
                    {interiorAddons.map(addon => (
                        <CheckboxCard key={addon.id} id={addon.id} name={addon.name} price={addon.price} checked={selectedAddons.includes(addon.id)} onToggle={() => onAddonToggle(addon.id)} />
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-lg font-semibold">Specialty Services</h4>
                <div className="grid grid-cols-1 gap-3">
                    {specialtyAddons.map(addon => (
                        <CheckboxCard key={addon.id} id={addon.id} name={addon.name} price={addon.price} checked={selectedAddons.includes(addon.id)} onToggle={() => onAddonToggle(addon.id)} />
                    ))}
                </div>
            </div>
        </div>
    );
}
