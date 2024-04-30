'use client';

import React from 'react';
import Link from 'next/link'; 
import { motion } from 'framer-motion'; 
import { signOut } from 'firebase/auth'; 
import { useRouter } from 'next/router'; 
import Image from 'next/image'; 
import { authentication } from '@/config/firebase'; 

const Header = () => {
    
    const router = useRouter();
    
    // Variante para la animación del header
    const headerVariants = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
    };

    // Estilos para el efecto de línea inferior
    const linkHoverStyles = "text-black mx-1 border-b-2 border-transparent hover:border-black";

    // Función para manejar el cierre de sesión
    const handleLogout = async () => {
        try {
            await signOut(authentication);
            router.push('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error.message);
        }
    };

    return (
        <div className="flex justify-center mt-5">
            <motion.header 
                className="bg-glass text-black rounded-full md:w-4/5 flex items-center"
                variants={headerVariants}
                initial="initial"
                animate="animate"
            >
                <div className="container mx-auto p-4">
                    <nav className="flex flex-wrap justify-center items-center">
                        <div className="w-full flex justify-center items-center gap-6 md:w-auto">
                            {/* Enlace del logo */}
                            <Link legacyBehavior href="/main">
                                <a className="flex items-center">
                                    {/* Imagen del logo */}
                                    <Image 
                                        src="/soshiza.png" 
                                        alt="Logo" 
                                        width={50} 
                                        height={50} 
                                        style={{ filter: 'invert(100%) sepia(100%) saturate(0%) hue-rotate(150deg)' }}
                                    />
                                </a>
                            </Link>
                            {/* enlaces */}
                            <Link legacyBehavior href="/products">
                                <a className={linkHoverStyles}>Productos</a>
                            </Link>
                            <Link legacyBehavior href="/sales">
                                <a className={linkHoverStyles}>Registrar Venta</a>
                            </Link>
                            <Link legacyBehavior href="/inventory">
                                <a className={linkHoverStyles}>Inventario</a>
                            </Link>
                            <Link legacyBehavior href="/salesAnalysis">
                                <a className={linkHoverStyles}>Analisis Venta</a>
                            </Link>
                            {/* Botón de cierre de sesión */}
                            <button onClick={handleLogout} className={linkHoverStyles}>Cerrar sesión</button>
                        </div>
                    </nav>
                </div>
            </motion.header>
        </div>
    );
};

export default Header;
