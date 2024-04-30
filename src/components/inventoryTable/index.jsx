import React, { useState, useEffect } from "react";
import { get, ref } from "firebase/database";
import { database, authentication } from "@/config/firebase";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // Nuevo estado para la categoría seleccionada
  const [categories, setCategories] = useState([]); // Nuevo estado para almacenar las categorías disponibles
  const [error, setError] = useState(null);
  const [userUID, setUserUID] = useState(null);
  const [totalUniqueNames, setTotalUniqueNames] = useState(0);

  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged((user) => {
      if (user) {
        setUserUID(user.uid);
      } else {
        setUserUID(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!userUID) return;

      const categoriesRef = ref(database, `clientes/${userUID}/category`);
      const snapshot = await get(categoriesRef);
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesArray = Object.keys(categoriesData).map((key) => categoriesData[key].name);
        setCategories(categoriesArray);
      }
    };

    fetchCategories();
  }, [userUID]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (!userUID) {
          throw new Error("No hay un usuario autenticado");
        }

        const productRef = ref(database, `clientes/${userUID}/products`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
          let productList = [];
          let uniqueNames = new Set();
          snapshot.forEach((data) => {
            let product = data.val();
            productList.push({
              key: data.key,
              name: product.name,
              category: product.category,
              entryDate: product.entryDate,
              quantityTotal: product.quantityTotal, 
              quantity: product.quantity,
              defectiveQuantity: product.defectiveQuantity || 0,
              price: product.price,
              unitValue: product.unitValue,
              available: product.available,
            });

            uniqueNames.add(product.name);
          });
          setProducts(productList);
          setTotalUniqueNames(uniqueNames.size);
          setLoading(false);
        } else {
          console.log("No hay datos disponibles");
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
        setError(error.message);
      }
    };

    if (userUID) {
      fetchProducts();
    }

  }, [userUID]);

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchValue.toLowerCase()) &&
    (selectedCategory === "" || product.category === selectedCategory) // Filtrar por categoría
  );

  const totalQuantity = filteredProducts.reduce((acc, product) => acc + parseInt(product.quantity), 0);
  const totalDefectiveQuantity = filteredProducts.reduce((acc, product) => acc + parseInt(product.defectiveQuantity), 0);

  const handlePrint = () => {
    const printContent = document.getElementById("print-content").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Vuelve a cargar la página para restablecer el contenido original
  };

  return (
    <div className="mx-auto p-4">
      <h2 className="text-center text-2xl font-bold mb-4">Productos</h2>
      <div className="mb-4 flex flex-col items-center">
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Búsqueda por Nombre"
          className="text-black border border-gray-300 rounded-md px-3 py-2 mr-2"
        />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="text-black border border-gray-300 rounded-md px-3 py-2 mr-2"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4" onClick={handlePrint}>
        Imprimir Tabla
      </button>
      <div id="print-content">
        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <>
            <p className="mb-4">Cantidad de Productos de la Empresa: {totalUniqueNames}</p>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Entrada
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad Actual
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto Defectuoso
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Costo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Venta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponible
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.key}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.entryDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.quantityTotal}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.defectiveQuantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.unitValue}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.available === "si" ? "Sí" : "No"}</div>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap" colSpan="2">Cantidad Total de Productos</td>
                  <td className="px-6 py-4 whitespace-nowrap"></td>
                  <td classname="px-6 py-4 whitespace-nowrap"></td>
                  <td className="px-6 py-4 whitespace-nowrap">{totalQuantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{totalDefectiveQuantity}</td>
                  <td colSpan="3"></td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductTable;
