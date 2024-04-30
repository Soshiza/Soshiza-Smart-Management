import React from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/auth/protectedRoute';
import '@/app/globals.css'
import Header from '@/components/header/header';
import SalesForm from '@/components/salesForm';
import AddProduct from '@/components/addProduct';
import ManualSale from '@/components/manualSale';

function Main() {
    const router = useRouter();

    return (
        <ProtectedRoute>
            <div>
                <Header />
                <div  className='flex items-center justify-center gap-2'>
                    <SalesForm />
                    <AddProduct/>
                    <ManualSale />
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default Main;