import React, { useState, useEffect } from "react";
import { ref, push, set, get } from "firebase/database";
import { database, storage, authentication } from "@/config/firebase";
import { getDownloadURL, uploadBytes, ref as storageRef } from "firebase/storage";
import QRCode from "qrcode";
import { motion } from "framer-motion";

const ProductForm = () => {
  const [name, setName] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const [price, setPrice] = useState("");
  const [quantityTotal, setQuantityTotal] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [userUID, setUserUID] = useState("");

  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged((user) => {
      if (user) {
        setUserUID(user.uid);
        fetchCategories(user.uid);
      } else {
        setUserUID(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchCategories = async (userID) => {
    const categoriesRef = ref(database, `clientes/${userID}/category`);
    const snapshot = await get(categoriesRef);
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      const categoriesArray = Object.keys(categoriesData).map((key) => ({
        id: key,
        name: categoriesData[key].name,
      }));
      setCategories(categoriesArray);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormSubmitted(true);

    if (!userUID) {
      return;
    }

    // Crear una nueva referencia para el producto
    const productRef = push(ref(database, `clientes/${userUID}/products`));

    let imageUrl = "";
    if (image) {
      // Crear una referencia única para la imagen dentro de la carpeta del usuario
      const imageStorageRef = storageRef(
        storage,
        `users/${userUID}/images/${image.name}`
      );
      await uploadBytes(imageStorageRef, image);
      imageUrl = await getDownloadURL(imageStorageRef);
    }

    // Generar código QR
    const qrCodeUrl = await QRCode.toDataURL(productRef.key);
    const qrCodeBlob = await fetch(qrCodeUrl).then((res) => res.blob());

    // Crear una referencia única para el código QR dentro de la carpeta del usuario
    const qrCodeStorageRef = storageRef(
      storage,
      `users/${userUID}/qrCodes/${productRef.key}.png`
    );
    await uploadBytes(qrCodeStorageRef, qrCodeBlob);
    const qrCodeImageUrl = await getDownloadURL(qrCodeStorageRef);

    // Guardar datos del producto
    await set(productRef, {
      name,
      entryDate,
      unitValue,
      price,
      quantityTotal,
      quantity,
      description,
      available,
      imageUrl,
      qrCodeImageUrl,
      category: selectedCategory,
    });

    // Resetear formulario
    setName("");
    setEntryDate("");
    setUnitValue("");
    setPrice("");
    setQuantityTotal("");
    setQuantity("");
    setDescription("");
    setAvailable("");
    setImage(null);
    setSelectedCategory("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-glass p-6 rounded-lg mt-28"
      style={{ width: "500px" }}
    >
      {/* Campos del formulario */}
      <div className="relative z-0 w-full mb-5 group mt-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          placeholder=" "
          required
        />
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Nombre
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group mt-4">
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          placeholder=" "
          required
        />
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Fecha de ingreso:
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group mt-4">
        <input
          type="number"
          value={unitValue}
          onChange={(e) => setUnitValue(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          placeholder=" "
          required
        />
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Precio Costo:
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group mt-4">
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          placeholder=" "
          required
        />
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Precio Venta:
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group mt-4">
        <input
          type="number"
          value={quantityTotal}
          onChange={(e) => setQuantityTotal(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          placeholder=" "
          required
        />
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Cantidad de ingreso
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group mt-4">
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          placeholder=" "
          required
        />
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Cantidad disponible
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group mt-4">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          placeholder=" "
          required
        />
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Descripción
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group mt-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          required
        >
          <option value="">Seleccionar Categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Categoría
        </label>
      </div>
      <div className="relative z-0 w-full mb-5 group mt-4">
        <select
          value={available}
          onChange={(e) => setAvailable(e.target.value)}
          className="block py-2.5 px-0 w-full text-sm text-black bg-transparent border-0 border-b-2 border-black appearance-none dark:text-black dark:border-black dark:focus:border-black focus:outline-none focus:ring-0 focus:border-black peer"
          required
        >
          <option value="">Seleccionar</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
        <label className="peer-focus:font-medium absolute text-sm text-dark duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-black peer-focus:dark:text-black peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          Disponible para la venta?
        </label>
      </div>
      <input
        type="file"
        onChange={handleImageChange}
        className="hidden"
        id="fileInput"
        required
      />
      <label
        htmlFor="fileInput"
        className="text-white bg-green-900 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 shadow-lg mt-4 cursor-pointer"
      >
        Seleccionar Archivo
      </label>

      {/* Botón de enviar */}
      <motion.button
        type="submit"
        className="text-white bg-green-900 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 shadow-lg mt-4"
        initial={{ scale: 1 }}
        animate={{ scale: formSubmitted ? 1.2 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {formSubmitted ? "✔" : "Enviar"}
      </motion.button>
    </form>
  );
};

export default ProductForm;
