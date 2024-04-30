import { useState, useEffect } from "react";
import { ref, push, set, onValue, remove } from "firebase/database";
import { database, authentication } from "@/config/firebase";

const Categories = () => {
  // State para el nombre de la categoría y la lista de categorías
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);

  // Función para cargar las categorías desde la base de datos
  const loadCategories = async () => {
    try {
      const user = authentication.currentUser;
      if (user) {
        // Referencia a las categorías del usuario actual
        const categoriesRef = ref(database, `clientes/${user.uid}/category`);
        // Escuchar cambios en la base de datos y actualizar el estado
        onValue(categoriesRef, (snapshot) => {
          const categoriesData = snapshot.val();
          if (categoriesData) {
            // Convertir el objeto de categorías en un array
            const categoriesArray = Object.keys(categoriesData).map((key) => ({
              id: key,
              name: categoriesData[key].name
            }));
            setCategories(categoriesArray);
          } else {
            setCategories([]);
          }
        });
      }
    } catch (error) {
      console.error("Error al cargar las categorías:", error);
    }
  };

  useEffect(() => {
    // Cargar las categorías al montar el componente
    loadCategories();
  }, []);

  // Manejar cambios en el input del nombre de la categoría
  const handleInputChange = (event) => {
    setCategoryName(event.target.value);
  };

  // Agregar una nueva categoría a la base de datos
  const addCategory = async () => {
    try {
      const user = authentication.currentUser;
      if (user) {
        // Referencia a las categorías del usuario actual
        const categoriesRef = ref(database, `clientes/${user.uid}/category`);
        // Generar una nueva referencia para la categoría
        const newCategoryRef = push(categoriesRef);
        // Agregar la nueva categoría a la base de datos
        await set(newCategoryRef, {
          name: categoryName
        });

        // Limpiar el campo del nombre de la categoría después de agregarla
        setCategoryName("");
      }
    } catch (error) {
      console.error("Error al agregar la categoría:", error);
    }
  };

  // Eliminar una categoría existente de la base de datos
  const deleteCategory = async (categoryId) => {
    try {
      const user = authentication.currentUser;
      if (user) {
        // Referencia a la categoría específica a eliminar
        const categoryRef = ref(database, `clientes/${user.uid}/category/${categoryId}`);
        // Eliminar la categoría de la base de datos
        await remove(categoryRef);
      }
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Agregar Categoría</h2>
      {/* Input para el nombre de la categoría */}
      <input
        type="text"
        value={categoryName}
        onChange={handleInputChange}
        className="border border-gray-300 px-3 py-2 rounded-md mb-2"
      />
      {/* Botón para agregar una nueva categoría */}
      <button
        onClick={addCategory}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Agregar
      </button>

      <h2 className="text-xl font-bold mt-4 mb-2">Categorías</h2>
      <ul>
        {/* Iterar sobre las categorías y mostrarlas */}
        {categories.map((category) => (
          <li key={category.id} className="flex items-center justify-between border-b py-2">
            {/* Nombre de la categoría */}
            <span>{category.name}</span>
            {/* Botón para eliminar la categoría */}
            <button
              onClick={() => deleteCategory(category.id)}
              className="text-red-500 hover:text-red-600"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;
