'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, CreditCard, User } from 'lucide-react';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const paymentType = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    const isOnlinePaymentSuccess = sessionId && bookingId;
    const isInPersonPayment = paymentType === 'in_person';

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Card className="shadow-xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <CardTitle className="text-3xl font-bold text-green-500">{isOnlinePaymentSuccess ? 'Payment Successful!' : 'Booking Confirmed!'}</CardTitle>
                        <CardDescription className="text-lg">{isOnlinePaymentSuccess ? 'Your payment has been processed and your appointment is confirmed.' : 'Your car detailing appointment has been successfully scheduled.'}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {bookingId && (
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Booking Reference</span>
                                </div>
                                <p className="font-mono text-sm text-muted-foreground">{bookingId}</p>
                            </div>
                        )}

                        {sessionId && (
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">Payment Reference</span>
                                </div>
                                <p className="font-mono text-sm text-muted-foreground">{sessionId}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">What's Next?</h3>

                            {isInPersonPayment && (
                                <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <CreditCard className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-blue-400">Payment: In Person</p>
                                        <p className="text-sm text-blue-300">You can pay when our team arrives for your appointment.</p>
                                    </div>
                                </div>
                            )}

                            {isOnlinePaymentSuccess && (
                                <div className="flex items-start space-x-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                    <CreditCard className="w-5 h-5 text-green-500 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-green-400">Payment: Completed Online</p>
                                        <p className="text-sm text-green-300">Your payment has been successfully processed. No additional payment is required.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start space-x-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-green-400">Confirmation Email</p>
                                    <p className="text-sm text-green-300">You'll receive a confirmation email with all the details shortly.</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-3">Need to make changes?</h3>
                            <p className="text-muted-foreground text-sm mb-4">If you need to reschedule or cancel your appointment, please contact us with your booking reference.</p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button asChild className="flex-1">
                                    <Link href="/">Return Home</Link>
                                </Button>
                                <Button asChild variant="outline" className="flex-1">
                                    <Link href="/booking">Book Another</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
