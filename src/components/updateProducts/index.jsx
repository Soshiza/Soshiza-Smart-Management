"use client";

import React, { useState, useEffect } from "react";
import { database } from "@/config/firebase";
import { ref, get, update } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const EditProduct = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [defectiveQuantity, setDefectiveQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [addingNormalProduct, setAddingNormalProduct] = useState(false);
  const [addingDefectiveProduct, setAddingDefectiveProduct] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [uid, setUid] = useState(null);
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        const productRef = ref(database, `clientes/${user.uid}/products`);
      } else {
        setUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setDescription(product.description || "");
      setAvailable(product.available || "");
      setQuantity("");
      setDefectiveQuantity(product.defectiveQuantity || "");
    }
  }, [product]);

  const handleSearch = () => {
    if (!searchTerm) {
      setMessage("Por favor, ingrese el nombre del producto");
      setProduct(null);
      setShowForm(false);
      return;
    }

    const productRef = ref(database, `clientes/${uid}/products`);
    get(productRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const products = snapshot.val();
          const productKeys = Object.keys(products);
          const foundProductKey = productKeys.find(
            (key) =>
              products[key].name.toLowerCase() === searchTerm.toLowerCase()
          );
          if (foundProductKey) {
            setProduct({ key: foundProductKey, ...products[foundProductKey] });
            setMessage("");
            setShowForm(true);
          } else {
            setProduct(null);
            setMessage("Producto no encontrado");
            setShowForm(false);
          }
        } else {
          setMessage("No hay productos en la base de datos");
          setShowForm(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setMessage("Error al buscar el producto");
      });
  };

  const handleUpdate = () => {
    const productRef = ref(database, `clientes/${uid}/products/${product.key}`);
    const updatedData = {};
    if (name.trim() !== "") {
      updatedData.name = name;
    }
    if (price.trim() !== "") {
      updatedData.price = price;
    }
    if (unitValue.trim() !== "") {
      updatedData.unitValue = unitValue;
    }
    if (description.trim() !== "") {
      updatedData.description = description;
    }
    if (available.trim() !== "") {
      updatedData.available = available;
    }
    if (quantity.trim() !== "" && addingNormalProduct) {
      const updatedQuantity = parseInt(quantity) + parseInt(product.quantity);
      updatedData.quantity = updatedQuantity.toString();
    }
    if (defectiveQuantity.trim() !== "" && addingDefectiveProduct) {
      const updatedDefectiveQuantity =
        parseInt(defectiveQuantity) + parseInt(product.defectiveQuantity || 0);
      updatedData.defectiveQuantity = updatedDefectiveQuantity.toString();
      const updatedTotalQuantity =
        parseInt(product.quantity) - parseInt(defectiveQuantity);
      updatedData.quantity = updatedTotalQuantity.toString();
    }
    update(productRef, updatedData)
      .then(() => {
        setUpdateMessage("Producto actualizado exitosamente");
        setShowForm(false);
        setTimeout(() => {
          setUpdateMessage("");
          setSearchTerm("");
        }, 3000);
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        setMessage("Error al actualizar el producto");
      });
  };

  const handleAddNormalProduct = () => {
    setAddingNormalProduct(true);
    setAddingDefectiveProduct(false);
  };

  const handleAddDefectiveProduct = () => {
    setAddingNormalProduct(false);
    setAddingDefectiveProduct(true);
  };

  return (
    <div className="mx-auto max-w-md" style={{ width: "640px" }}>
      <input
        type="text"
        placeholder="Buscar producto por nombre"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="text-black block w-full p-2 mt-4 mb-2 border-gray-300 border rounded-md focus:outline-none focus:border-blue-500"
      />
      <button
        onClick={handleSearch}
        className="block w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
      >
        Buscar
      </button>
      {product && showForm && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Editar Producto: {product.name}</h2>
          <div className="mt-2">
            <label className="block">Nombre:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={product.name.toString()}
              className="text-gray-500 w-full p-2 mt-1 border-gray-300 border rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mt-2">
            <label className="block">Precio Venta:</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={product.price.toString()}
              className="text-gray-500 w-full p-2 mt-1 border-gray-300 border rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mt-2">
            <label className="block">Precio Costo:</label>
            <input
              type="text"
              value={unitValue}
              onChange={(e) => setUnitValue(e.target.value)}
              placeholder={product.unitValue.toString()}
              className="text-gray-500 w-full p-2 mt-1 border-gray-300 border rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="mt-2">
            <label className="block">Descripción:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={product.description.toString()}
              className="text-gray-500 w-full p-2 mt-1 border-gray-300 border rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
            <div className="mt-2">
            <label className="block">Disponible:</label>
            <input
                type="text"
                value={available}
                onChange={(e) => setAvailable(e.target.value)}
                placeholder={product.available.toString()}
                className="text-gray-500 w-full p-2 mt-1 border-gray-300 border rounded-md focus:outline-none focus:border-blue-500"
            />
            </div>
          {addingNormalProduct && (
            <div className="mt-2">
              <label className="block">Cantidad:</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder=""
                className="text-gray-500 w-full p-2 mt-1 border-gray-300 border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
          {addingDefectiveProduct && (
            <div className="mt-2">
              <label className="block">Cantidad Defectuosa:</label>
              <input
                type="text"
                value={defectiveQuantity}
                onChange={(e) => setDefectiveQuantity(e.target.value)}
                placeholder=""
                className="text-gray-500 w-full p-2 mt-1 border-gray-300 border rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
          <div className="flex mt-4">
            <button
              onClick={handleAddNormalProduct}
              className="flex-1 mr-2 px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:bg-green-600"
            >
              Agregar Producto
            </button>
            <button
              onClick={handleAddDefectiveProduct}
              className="flex-1 ml-2 px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600"
            >
              Agregar Producto Defectuoso
            </button>
          </div>
          <button
            onClick={handleUpdate}
            className="block w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          >
            Actualizar Producto
          </button>
        </div>
      )}
      {updateMessage && <p className="mt-4 text-green-500">{updateMessage}</p>}
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default EditProduct;
