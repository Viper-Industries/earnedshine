'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LogOut, User } from 'lucide-react';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { AvailabilityTab } from '@/components/admin/AvailabilityTab';
import { AllBookingsTab } from '@/components/admin/AllBookingsTab';
import { AuthWrapper } from '@/components/admin/AuthWrapper';
import type { User as UserType } from '@/types/user';

interface AdminPageContentProps {
    user?: UserType;
    handleLogout?: () => void;
}

function AdminPageContent({ user, handleLogout }: AdminPageContentProps) {
    return (
        <main className="p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
                            <p className="text-muted-foreground text-lg">Monitor your car detailing business performance and manage bookings.</p>
                        </div>

                        {user && handleLogout && (
                            <div className="flex items-center space-x-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center space-x-2 cursor-help">
                                                <User className="h-4 w-4" />
                                                <span className="text-sm font-medium">{user.username}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <div className="text-center">
                                                <p className="font-medium">{user.username}</p>
                                                <p className="text-xs opacity-70">{user.email}</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid grid-cols-3 w-80 bg-zinc-800 mb-2">
                        <TabsTrigger value="overview" className="data-[state=active]:!bg-[#09090B] data-[state=active]:text-foreground data-[state=active]:border-0" style={{ '--active-bg': '#09090B' } as React.CSSProperties}>
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="availability" className="data-[state=active]:!bg-[#09090B] data-[state=active]:text-foreground data-[state=active]:border-0" style={{ '--active-bg': '#09090B' } as React.CSSProperties}>
                            Availability
                        </TabsTrigger>
                        <TabsTrigger value="all-bookings" className="data-[state=active]:!bg-[#09090B] data-[state=active]:text-foreground data-[state=active]:border-0" style={{ '--active-bg': '#09090B' } as React.CSSProperties}>
                            All Bookings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <OverviewTab />
                    </TabsContent>

                    <TabsContent value="availability">
                        <AvailabilityTab />
                    </TabsContent>

                    <TabsContent value="all-bookings">
                        <AllBookingsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </main>
    );
}

export default function AdminPage() {
    return (
        <AuthWrapper>
            <AdminPageContent />
        </AuthWrapper>
    );
}
