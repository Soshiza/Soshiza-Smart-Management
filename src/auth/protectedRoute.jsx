import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth'; // Importa la función para detectar cambios en el estado de autenticación de Firebase
import { authentication } from '@/config/firebase'; // Importa la instancia de autenticación de Firebase

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null); // Estado para almacenar la información del usuario
  const [loading, setLoading] = useState(true); // Estado para indicar si se está cargando la verificación de autenticación

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authentication, (user) => {
      setUser(user); // Actualiza el estado del usuario cuando cambia el estado de autenticación
      setLoading(false); // Indica que la verificación de autenticación ha terminado
    });

    return () => unsubscribe();
  }, []); // El efecto se ejecuta solo una vez al montar el componente

  // Si se está cargando la verificación de autenticación, no renderiza nada en este componente
  if (loading) {
    return null;
  }

  // Si el usuario está autenticado, muestra el contenido protegido
  if (user) {
    return children;
  }

  // Si el usuario no está autenticado, redirige a la página de inicio de sesión
  if (!user && !loading) {
    router.push('/');
  }

  // Si no se cumple ninguna de las condiciones anteriores, no renderiza nada en este componente
  return null;
};

export default ProtectedRoute;
