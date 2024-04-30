import React, { useState, useEffect } from "react";
import { authentication, database } from "@/config/firebase";
import { ref, onValue, remove, push, get, query, orderByChild, equalTo, update, serverTimestamp } from "firebase/database";

const SalesForm = () => {
  const [salesData, setSalesData] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [saleDateTime, setSaleDateTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [paymentMethodError, setPaymentMethodError] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [cuotas, setCuotas] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = authentication.currentUser;
        if (user) {
          const uid = user.uid;
          const salesRef = ref(database, `clientes/${uid}/ventas/SellT`);
          onValue(salesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              const sales = Object.entries(data).map(([key, value]) => ({
                id: key,
                name: value.name,
                price: value.price,
              }));
              setSalesData(sales);
            } else {
              setSalesData([]);
            }
          });
        }
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchData();

    // Actualizar la hora cada segundo
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);

  const handleDeleteProduct = async (productId) => {
    try {
      const user = authentication.currentUser;
      if (user) {
        const uid = user.uid;
        const productRef = ref(database, `clientes/${uid}/ventas/SellT/${productId}`);
        await remove(productRef);
        setSalesData(salesData.filter((product) => product.id !== productId));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleProcessSale = async () => {
    try {
      if (!paymentMethod) {
        setPaymentMethodError(true);
        return;
      } else {
        setPaymentMethodError(false);
      }

      const user = authentication.currentUser;
      if (user) {
        const uid = user.uid;

        // Obtener la fecha y hora actual
        const currentDate = new Date();
        // Formatear la fecha y hora actual en ISO
        const isoDateTime = currentDate.toISOString();

        // Guardar la fecha y hora de la venta en formato ISO
        setSaleDateTime(isoDateTime);

        // Obtener la referencia a la colección de productos del inventario
        const productsRef = ref(database, `clientes/${uid}/products`);

        // Iterar sobre los productos vendidos para actualizar el inventario
        for (const product of salesData) {
          // Buscar el producto en el inventario basándose en su nombre
          const productsQuery = query(productsRef, orderByChild("name"), equalTo(product.name));
          const snapshot = await get(productsQuery);
          const productSnapshot = snapshot.val();

          // Verificar si se encontró el producto en el inventario
          if (productSnapshot) {
            // Obtener el ID del documento del producto en el inventario
            const productId = Object.keys(productSnapshot)[0];

            // Obtener la cantidad vendida y la cantidad actual en el inventario
            const soldQuantity = 1; // Supongo que siempre se vende 1 unidad del producto
            const currentQuantity = productSnapshot[productId].quantity;

            // Calcular la nueva cantidad en el inventario después de la venta
            const newQuantity = currentQuantity - soldQuantity;

            // Actualizar la cantidad en el inventario
            await update(ref(database, `clientes/${uid}/products/${productId}`), {
              quantity: newQuantity
            });
          } else {
            console.error(`El producto "${product.name}" no se encontró en el inventario.`);
          }
        }

        // Enviar datos a la colección finalSale
        const finalSaleRef = ref(database, `clientes/${uid}/ventas/finalSale`);
        await push(finalSaleRef, {
          products: salesData,
          totalAmount: salesData.reduce((total, product) => total + Number(product.price), 0),
          paymentMethod: paymentMethod,
          saleDateTime: isoDateTime, // Incluir la fecha y hora de la venta en formato ISO
          ticketNumber: paymentMethod === "efectivo" ? ticketNumber : null,
          cuotas: paymentMethod === "credito" ? cuotas : null
        });

        // Eliminar el documento actual de SellT
        const sellTRef = ref(database, `clientes/${uid}/ventas/SellT`);
        await remove(sellTRef);

        // Mostrar la ventana modal
        setModalVisible(true);

        // Cerrar la ventana modal después de 3 segundos
        setTimeout(() => {
          setModalVisible(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error processing sale:", error);
    }
  };

  return (
    <div className="w-1/3 my-8 px-4 bg-glass">
      <div className="bg-glass shadow-md rounded px-8 pt-6 pb-8 my-4">
        <h1 className="text-3xl font-bold mb-6">Venta</h1>
        {salesData.map((product, index) => (
          <div key={index} className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <div className="flex justify-between">
                <span>precio ${product.price}</span>
              </div>
            </div>
            <button className="text-red-500 font-bold" onClick={() => handleDeleteProduct(product.id)}>Eliminar</button>
          </div>
        ))}
        <hr className="my-4" />
        <div className="flex justify-between">
          <span className="font-bold">Cantidad Productos:</span>
          <span>{salesData.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Precio Total:</span>
          <span>
            $
            {salesData.reduce((total, product) => total + Number(product.price), 0)}
          </span>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-bold mb-2">Método de Pago:</label>
          <select
            className={`block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline ${paymentMethodError ? 'border-red-500' : ''}`}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">Seleccionar Método de Pago</option>
            <option value="efectivo">Efectivo</option>
            <option value="debito">Débito</option>
            <option value="credito">Crédito</option>
          </select>
          {paymentMethodError && <p className="text-red-500 text-xs italic mt-2">Por favor selecciona un método de pago</p>}
        </div>
        {paymentMethod === "efectivo" && (
          <div className="mt-4">
            <label className="block text-sm font-bold mb-2">Número de Boleta:</label>
            <input
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              className="block w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}
        {paymentMethod === "credito" && (
          <div className="mt-4">
            <label className="block text-sm font-bold mb-2">Seleccionar Cuotas:</label>
            <select
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              value={cuotas}
              onChange={(e) => setCuotas(e.target.value)}
              required
            >
              <option value="">Seleccionar Cuotas</option>
              <option value="3">3 cuotas</option>
              <option value="6">6 cuotas</option>
              <option value="12">12 cuotas</option>
            </select>
          </div>
        )}
        <div className="mt-4">
          <label className="block text-sm font-bold mb-2">Hora Actual:</label>
          <div className="bg-gray-200 px-4 py-2 rounded">{currentTime.toLocaleTimeString()}</div>
        </div>
        <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleProcessSale}>Procesar Venta</button>
      </div>
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-md">
            <p>Venta ingresada con éxito</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesForm;
