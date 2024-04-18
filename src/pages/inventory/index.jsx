import React from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/auth/protectedRoute';
import '@/app/globals.css'
import Header from '@/components/header/header';
import ProductTable from '@/components/inventoryTable';

function Main() {
    const router = useRouter();


    return (
        <ProtectedRoute>
            <div>
                <Header />
                <ProductTable />
            </div>
        </ProtectedRoute>
    );
}

export default Main;
