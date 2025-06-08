import { Suspense } from 'react';

function Loading() {
    return <h2>Loading...</h2>;
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
