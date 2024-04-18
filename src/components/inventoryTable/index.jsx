import React, { useState, useEffect } from "react";
import { get, ref } from "firebase/database";
import { database, authentication } from "@/config/firebase";

const ProductTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [error, setError] = useState(null);
  const [userUID, setUserUID] = useState(null); // Inicializar con null
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
          let uniqueNames = new Set(); // Utilizamos un conjunto para almacenar nombres únicos
          snapshot.forEach((data) => {
            let product = data.val();
            productList.push({
              key: data.key,
              name: product.name,
              entryDate: product.entryDate,
              quantity: product.quantity,
              defectiveQuantity: product.defectiveQuantity || 0, // Manejar el caso de undefined
              price: product.price,
              unitValue: product.unitValue,
              available: product.available,
            });

            uniqueNames.add(product.name); // Agregamos cada nombre al conjunto
          });
          setProducts(productList);
          setTotalUniqueNames(uniqueNames.size); // Establecemos el número total de nombres únicos
          setLoading(false);
        } else {
          console.log("No data available");
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
        setError(error.message); // Establecer el error en el estado
      }
    };

    if (userUID) { // Verificar si hay un usuario autenticado
      fetchProducts(); // Llamar a la función de búsqueda de productos
    }

  }, [userUID]); // Agregar userUID como dependencia

  const handleSearchChange = (event) => {
    setSearchValue(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Calcular las sumas solo para los productos filtrados
  const totalQuantity = filteredProducts.reduce((acc, product) => acc + parseInt(product.quantity), 0);
  const totalDefectiveQuantity = filteredProducts.reduce((acc, product) => acc + parseInt(product.defectiveQuantity), 0);

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
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p> // Mostrar el error si existe
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
                  Fecha de Entrada
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
                    <div className="text-sm text-gray-900">{product.entryDate}</div>
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
              {/* Fila para mostrar las sumas */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap" colSpan="2">Cantidad Total de Productos</td>
                <td className="px-6 py-4 whitespace-nowrap">{totalQuantity}</td>
                <td className="px-6 py-4 whitespace-nowrap">{totalDefectiveQuantity}</td>
                <td colSpan="3"></td> {/* Colspan para las celdas vacías */}
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ProductTable;
