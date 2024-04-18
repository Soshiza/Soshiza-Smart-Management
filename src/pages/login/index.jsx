"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importa la función de autenticación de Firebase
import { authentication } from '@/config/firebase'; // Importa la instancia de autenticación de Firebase

const LoginPage = () => {
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      // Autenticar al usuario con Firebase
      await signInWithEmailAndPassword(authentication, email, password);
      // Redirigir al usuario a la página principal después de iniciar sesión
      router.push('/main');
    } catch (error) {
      // Manejar errores de autenticación
      console.error('Error de autenticación:', error.message);
    }
  };

  // Resto del código
  useEffect(() => {
    if (!router.isReady) return;
    // Puedes realizar cualquier lógica adicional de inicialización aquí
  }, [router.isReady]);

  return (
    <section className="flex items-center justify-center min-h-screen glass-window">
      <div className="container mx-auto">
        {/* Contenedor para pantalla grande */}
        <div className="lg:flex lg:justify-center lg:border  lg:p-8 lg:rounded-lg">
          {/* Primer panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="glass-window rounded-lg shadow-lg px-8 py-10 max-w-md w-full lg:w-auto mb-4 lg:mb-0 lg:mr-4"
          >
            <h2 className="text-2xl font-bold mb-4">
              Bienvenido al gestor de tienda virtual
            </h2>
            <p className="text-gray-600 mb-4">
              Aquí encontrarás todo lo que necesitas para gestionar tu tienda
              virtual de forma eficiente.
            </p>
            <p className="text-gray-600">
              si necesita ayuda por favor contactarse a{' '}
              <a
                className="text-cyan-500"
                href="mailto:soshiza.agency@gmail.com"
              >
                soshiza.agency@gmail.com
              </a>{' '}
              o visite nuestra pagina web{' '}
              <a
                className="text-cyan-500"
                href="http://www.soshiza.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.soshiza.com
              </a>
            </p>
          </motion.div>

          {/* Segundo panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="glass-window rounded-lg shadow-lg px-8 py-10 max-w-md w-full lg:w-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
              Gestor de Tienda Virtual de Bazar al Sol
            </h2>
            <p className="text-gray-600 mb-4">
              Por favor, para continuar, ingrese su email y contraseña.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm border border-gray-300 p-2 w-full block"
                  placeholder="Ingrese su email"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 rounded-md sm:text-sm border border-gray-300 p-2 w-full block"
                  placeholder="Ingrese su contraseña"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
              >
                Ingresar
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
