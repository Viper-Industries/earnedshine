import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    value: string | number | undefined;
    description?: string;
}

export function StatCard({ title, value, description }: StatCardProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">{value !== undefined ? value : 'N/A'}</div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
}
