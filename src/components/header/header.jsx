'use client';

import React from 'react';
import Link from 'next/link'; 
import { motion } from 'framer-motion'; 
import Styles from './header.css';

const Header = () => {
    // Variante para la animación del header
    const headerVariants = {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
    };

    // Estilos para el efecto de línea inferior
    const linkHoverStyles = "text-black mx-1 border-b-2 border-transparent hover:border-black";

    return (
        <div className="flex justify-center mt-5">
            <motion.header 
                className="bg-glass text-black rounded-full w-3/5 md:w-2/5 flex items-center"
                variants={headerVariants}
                initial="initial"
                animate="animate"
            >
                <div className="container mx-auto p-4">
                    {/* Utiliza clases de Tailwind para manejar el diseño responsivo */}
                    <nav className="flex flex-wrap justify-center">
                        <div className="w-full flex justify-center gap-6 md:w-auto">
                            {/* Aplica un margen horizontal de 3px a cada enlace */}
                            <Link legacyBehavior href="/products">
                                <a className={linkHoverStyles}>Productos</a>
                            </Link>
                            <Link legacyBehavior href="/sales">
                                <a className={linkHoverStyles}>Ventas</a>
                            </Link>
                            <Link legacyBehavior href="/inventory">
                                <a className={linkHoverStyles}>Inventario</a>
                            </Link>
                        </div>
                    </nav>
                </div>
            </motion.header>
        </div>
    );
};

export default Header;
