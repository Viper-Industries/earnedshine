import { Suspense } from 'react';

function Loading() {
    return <h2>Loading...</h2>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return <Suspense fallback={<Loading />}>{children}</Suspense>;
}
