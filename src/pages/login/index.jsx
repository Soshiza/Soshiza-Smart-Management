'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { authentication } from '@/config/firebase';
import Image from 'next/image'; 

const LoginPage = () => {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(authentication, email, password);
      router.push('/main');
    } catch (error) {
      console.error('Error de autenticación:', error.message);
      setShowAlert(true);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    
  }, [router.isReady]);

  return (
    <section className="flex items-center justify-center min-h-screen glass-window">
      <div className="container mx-auto">
        <div className="lg:flex lg:justify-center lg:border  lg:p-8 lg:rounded-lg">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="glass-window rounded-lg shadow-lg px-8 py-10 max-w-md w-full lg:w-auto mb-4 lg:mb-0 lg:mr-4"
          >
            <h2 className="text-2xl font-bold mb-4">
              Bienvenido a Soshiza Smart Management
            </h2>
            <p className="text-gray-600 mb-4">
              Aquí encontrarás todo lo que necesitas para gestionar tu negocio, almacén o pyme de forma eficiente.
            </p>
            <p className="text-gray-600">
              Si necesitas ayuda por favor contactarse a{' '}
              <a
                className="text-cyan-500"
                href="mailto:soshiza.agency@gmail.com"
              >
                soshiza.agency@gmail.com
              </a>{' '}
              o visite nuestra página web{' '}
              <a
                className="text-cyan-500"
                href="http://www.soshiza.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.soshiza.com
              </a>
            </p>
            <div className="flex justify-center">
              <Image 
                src="/soshiza.png" 
                alt="soshiza smart management" 
                width={200} 
                height={200} 
                style={{ filter: 'invert(100%) sepia(100%) saturate(0%) hue-rotate(150deg)' }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
            className="glass-window rounded-lg shadow-lg px-8 py-10 max-w-md w-full lg:w-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
              Gestor de Negocios Soshiza Smart Management
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
      
      {showAlert && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Error de autenticación</h2>
            <p className="text-gray-600">El correo o la contraseña ingresados son incorrectos. Por favor, inténtelo nuevamente.</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md mt-4" onClick={() => setShowAlert(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default LoginPage;
