import React, { useState, useEffect } from "react"; 
import { ref, push } from "firebase/database";
import { database, authentication } from "@/config/firebase";

const ManualSale = () => {
  const [productPrice, setProductPrice] = useState("");
  const [error, setError] = useState(null);
  const [userUID, setUserUID] = useState("");

  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged((user) => {
      setUserUID(user ? user.uid : "");
    });

    return () => unsubscribe();
  }, []);

  const handleAddToSale = async () => {
    try {
      if (!userUID) {
        throw new Error("No hay un usuario autenticado");
      }
      
      if (!productPrice) {
        throw new Error("Por favor ingresa el precio del producto");
      }

      const saleRef = ref(database, `clientes/${userUID}/ventas/SellT`);
      await push(saleRef, {
        name: "otros",
        price: productPrice,
      });

      console.log("Producto 'otros' agregado a la venta");
      setError(null);
    } catch (error) {
      console.error("Error adding product to sale:", error);
      setError(error.message);
    }
  };

  return (
    <div className="w-1/3 my-8 px-4 bg-glass">
      <div className="mb-4">
        <h3 className="font-semibold">Producto</h3>
        <p>otros</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Precio</h3>
        <input
          type="number"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          placeholder="Precio del producto"
          className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>
      {error && <p className="mt-4 text-center text-red-500">Error: {error}</p>}
      <div className="flex justify-center">
        <button 
          className={`bg-blue-500 text-white px-4 py-2 rounded`}
          onClick={handleAddToSale}
        >
          Agregar a la venta
        </button>
      </div>
    </div>
  );
};

export default ManualSale;
