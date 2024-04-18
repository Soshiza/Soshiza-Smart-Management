import React, { useState, useEffect } from "react";
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { database, authentication } from "@/config/firebase";

const SearchProduct = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userUID, setUserUID] = useState("");

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

        const productsRef = ref(database, `clientes/${userUID}/products`);
        const productsQuery = query(productsRef, orderByChild("name"), equalTo(searchQuery));
        const snapshot = await get(productsQuery);
        if (snapshot.exists()) {
          setSearchResults(Object.values(snapshot.val()));
          setError(null);
        } else {
          setSearchResults([]);
          setError("No se encontraron productos con ese nombre");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setSearchResults([]);
        setError("Ocurrió un error al buscar los productos");
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery && userUID) {
      fetchProducts();
    }
  }, [searchQuery, userUID]);

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const downloadQRCode = async (qrCodeImageUrl) => {
    try {
      const response = await fetch(qrCodeImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qr_code.png"; // Nombre de archivo para descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR code:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 bg-glass" style={{ width: "640px" }}>
      <input
        type="text"
        value={searchQuery}
        onChange={handleChange}
        placeholder="Buscar producto por nombre"
        className="w-full py-2 mt-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />
      {loading && <p className="mt-4 text-center">Cargando...</p>}
      {error && <p className="mt-4 text-center text-red-500">Error: {error}</p>}
      {searchResults.length > 0 ? (
        <div>
          <h2 className="mt-6 mb-4 text-xl font-bold">Resultados de la búsqueda:</h2>
          {searchResults.map((product, index) => (
            <div key={index} className="flex border border-gray-200 rounded-lg p-4 mb-4">
              <div className="w-1/2 pr-4">
                <div className="mb-4">
                  <h3 className="font-semibold">Nombre Producto</h3>
                  <p>{product.name}</p>
                  <h3 className="mt-4 font-semibold">Fecha de Entrada</h3>
                  <p>{product.entryDate}</p>
                  <h3 className="mt-4 font-semibold">Precio Compra</h3>
                  <p>{product.unitValue}</p>
                  <h3 className="mt-4 font-semibold">Precio Venta</h3>
                  <p>{product.price}</p>
                  <h3 className="mt-4 font-semibold">Cantidad Disponible</h3>
                  <p>{product.quantity}</p>
                  <h3 className="mt-4 font-semibold">Disponible</h3>
                  <p>{product.available === "si" ? "Sí" : "No"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Descripción del Producto</h3>
                  <p>{product.description}</p>
                </div>
              </div>
              <div className="w-1/2 flex justify-center items-center gap-2">
                <div className="flex flex-col justify-center items-center">
                  <img src={product.imageUrl} alt={product.name} style={{ width: "200px", height: "auto", marginBottom: "10px" }} />
                  <img src={product.qrCodeImageUrl} alt={`QR Code for ${product.name}`} style={{ width: "200px", height: "auto" }} />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
                    onClick={() => downloadQRCode(product.qrCodeImageUrl)}
                  >
                    Descargar QR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-center">No se encontraron resultados</p>
      )}
    </div>
  );
};

export default SearchProduct;
