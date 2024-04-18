import React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth'; // Importa la función de cierre de sesión de Firebase
import { authentication } from '@/config/firebase'; // Importa la instancia de autenticación de Firebase
import ProtectedRoute from '@/auth/protectedRoute';
import '@/app/globals.css'
import Header from '@/components/header/header';
import LayoutProducts from '@/components/layoutProducts';

function Main() {
    const router = useRouter();

    return (
        <ProtectedRoute>
            <div className='h-full w-full'>
                <Header />
                <LayoutProducts className='w-full h-full' />
            </div>
        </ProtectedRoute>
    );
}

export default Main;
