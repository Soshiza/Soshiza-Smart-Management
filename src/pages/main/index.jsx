import React from 'react';
import { useRouter } from 'next/router';
import { signOut } from 'firebase/auth';
import { authentication } from '@/config/firebase';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/header/header';
import '@/app/globals.css';

function Main() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(authentication);
            router.push('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
        }
    };

    return (
        <>
        <Header />
        <div className="min-h-screen flex justify-center items-center">
            
            <div className="container mx-auto flex flex-col lg:flex-row py-10 px-24">
                {/* Contenedor Izquierdo */}
                <div className="lg:w-1/2 flex justify-center items-center mb-8">
                    <motion.div 
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-glass w-64 h-64 relative"
                    >
                        <Image 
                            src="/soshiza.png"
                            layout="fill"
                            objectFit="contain"
                            style={{ filter: 'invert(100%) sepia(100%) saturate(0%) hue-rotate(150deg)' }}
                        />
                    </motion.div>
                </div>
                {/* Contenedor Derecho */}
                <div className="lg:w-1/2 lg:pl-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Bienvenido a Soshiza Smart Management!</h1>
                        <p className="text-lg text-gray-600">Tu gestor de negocios todo en uno</p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-center mb-8"
                    >
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Características principales:</h2>
                        <ul className="text-center">
                            <li>Gestión de inventario en tiempo real</li>
                            <li>Creación de productos y categorías</li>
                            <li>Gestor de ventas con registro exhaustivo</li>
                            <li>Análisis de ventas y pagos recurrentes</li>
                            <li>Integración de escaneo de productos</li>
                            <li>Automatización de tareas</li>
                        </ul>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="text-center"
                    >
                        <button 
                            onClick={handleLogout} 
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md shadow-md transition duration-300"
                        >
                            Cerrar sesión
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
        </>
    );
}


export default Main;
