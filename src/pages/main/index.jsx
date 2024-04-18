import React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth'; // Importa la función de cierre de sesión de Firebase
import { authentication } from '@/config/firebase'; // Importa la instancia de autenticación de Firebase
import ProtectedRoute from '@/auth/protectedRoute';
import '@/app/globals.css'
import Header from '@/components/header/header';

function Main() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(authentication); // Cierra la sesión del usuario en Firebase
            router.push('/'); // Redirige al usuario a la página de inicio de sesión
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
        }
    };

    return (
        <ProtectedRoute>
            <div>
                <Header />
                <h1>Felicitaciones, has podido loguear con éxito</h1>
                <button onClick={handleLogout}>Cerrar sesión</button>
            </div>
        </ProtectedRoute>
    );
}

export default Main;
